from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from django.db import connection

# --- IMPORTS PROPIOS ---
from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer, SystemStatusSerializer
from .reports import generar_pdf_inventario   
from .ai import generar_descripcion_ia, procesar_audio_con_ia, chat_con_inventario
from .permissions import IsAdminOrReadOnly   
from .utils import get_email_template

# --- IMPORTS DE ARQUITECTURA LIMPIA (CORE DOMAIN) ---
from core_domain.use_cases.empresa_use_cases import CrearEmpresaUseCase, ListarEmpresasUseCase
from core_domain.exceptions import EntityValidationError, BusinessRuleError, InfrastructureError
from .adapters import DjangoEmpresaRepository

import requests 
import base64   
import logging
from decouple import config 

# Configurar un logger básico para que los errores salgan en consola
logger = logging.getLogger(__name__)

# --------------------------------------

class EmpresaViewSet(viewsets.ModelViewSet):
    """
    ViewSet refactorizado con Clean Architecture.
    La lógica de CREAR y LISTAR ahora vive en el 'core-domain', no en Django.
    """
    queryset = EmpresaModel.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_value_regex = '[^/]+'
    lookup_field = 'nit'

    def list(self, request, *args, **kwargs):
        try:
            # 1. Instanciar Adaptador (Django)
            repo = DjangoEmpresaRepository()
            # 2. Instanciar Caso de Uso (Dominio Puro)
            use_case = ListarEmpresasUseCase(repo)
            # 3. Ejecutar Lógica
            empresas_entidades = use_case.execute()
            
            # 4. Serializar y Responder
            serializer = self.get_serializer(empresas_entidades, many=True)
            return Response(serializer.data)

        except InfrastructureError as e:
            logger.error(f"Error de Infraestructura en Listar Empresas: {str(e)}")
            return Response(
                {"error": "Error interno conectando con la base de datos."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )
        except Exception as e:
            logger.critical(f"Error inesperado en Listar Empresas: {str(e)}")
            return Response(
                {"error": "Error inesperado en el sistema."}, 
                status=status.HTTP_500_INTERNAL_SERVER_ERROR
            )

    def create(self, request, *args, **kwargs):
        try:
            data = request.data
            
            # 1. Instanciar Adaptador y Caso de Uso
            repo = DjangoEmpresaRepository()
            use_case = CrearEmpresaUseCase(repo)
            
            # 2. Ejecutar Lógica de Negocio (Validaciones ocurren aquí dentro)
            empresa_creada = use_case.execute(
                nit=data.get('nit'),
                nombre=data.get('nombre'),
                direccion=data.get('direccion'),
                telefono=data.get('telefono')
            )
            
            # 3. Responder
            serializer = self.get_serializer(empresa_creada)
            return Response(serializer.data, status=status.HTTP_201_CREATED)

        except (EntityValidationError, BusinessRuleError) as e:
            # Errores de Negocio (400) - Ejemplo: NIT inválido o Empresa duplicada
            logger.warning(f"Error de Negocio al crear empresa: {str(e)}")
            return Response({"detail": str(e)}, status=status.HTTP_400_BAD_REQUEST)
        
        except InfrastructureError as e:
            logger.error(f"Error de Infraestructura al crear empresa: {str(e)}")
            return Response({"detail": "Fallo en el almacenamiento de datos."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)
            
        except Exception as e:
            logger.critical(f"Error no controlado al crear empresa: {str(e)}")
            return Response({"detail": "Error interno del servidor."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)


class ProductoViewSet(viewsets.ModelViewSet):
    """
    ViewSet de Productos con Programación Defensiva (Try/Except).
    Mantiene la lógica en el ViewSet por ahora, pero blindada contra fallos.
    """
    queryset = ProductoModel.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly]
    
    def get_queryset(self):
        try:
            queryset = super().get_queryset()
            empresa_nit = self.request.query_params.get('empresa')
            if empresa_nit:
                queryset = queryset.filter(empresa_id=empresa_nit)
            return queryset
        except Exception as e:
            logger.error(f"Error filtrando productos: {str(e)}")
            # En get_queryset es mejor retornar vacío o fallar silenciosamente 
            # para no romper el admin de django, pero aquí lanzamos error controlado.
            return ProductoModel.objects.none()
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def chat_inventario(self, request):
        try:
            nit = request.data.get('nit')
            historial = request.data.get('historial') 
            
            if not nit or not historial:
                return Response({"error": "Faltan datos (nit o historial)"}, status=400)

            productos = self.get_queryset().filter(empresa_id=nit)
            
            if not productos.exists():
                return Response({"respuesta": "No hay productos registrados en esta empresa."})

            datos_minificados = []
            for p in productos:
                datos_minificados.append({
                    "cod": p.codigo,
                    "n": p.nombre,
                    "c": p.caracteristicas,
                    "p": p.precios
                })

            respuesta_ia = chat_con_inventario(historial, datos_minificados)
            return Response({"respuesta": respuesta_ia})

        except Exception as e:
            logger.error(f"Error en Chat IA: {str(e)}")
            return Response({"error": "El asistente inteligente no está disponible en este momento."}, status=503)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def interpretar_voz(self, request):
        try:
            audio_file = request.FILES.get('audio')
            
            if not audio_file:
                return Response({"error": "No se envió archivo de audio"}, status=400)
                
            datos_estructurados = procesar_audio_con_ia(audio_file)
            
            if datos_estructurados:
                return Response(datos_estructurados)
            else:
                return Response({"error": "No se pudo interpretar el audio"}, status=500)
        except Exception as e:
            logger.error(f"Error procesando voz: {str(e)}")
            return Response({"error": "Error procesando el servicio de voz."}, status=500)

    @action(detail=False, methods=['get'])
    def descargar_reporte(self, request):
        try:
            nit = request.query_params.get('empresa')
            productos = self.get_queryset()
            info_empresa = None
            
            if nit:
                productos = productos.filter(empresa_id=nit)
                if not productos.exists():
                    try:
                        empresa = EmpresaModel.objects.get(nit=nit)
                        info_empresa = {
                            'nombre': empresa.nombre,
                            'nit': empresa.nit,
                            'direccion': empresa.direccion,
                            'telefono': empresa.telefono
                        }
                    except EmpresaModel.DoesNotExist:
                        pass

            buffer = generar_pdf_inventario(productos, info_empresa_backup=info_empresa)
            return FileResponse(buffer, as_attachment=True, filename='inventario.pdf')

        except Exception as e:
            logger.error(f"Error generando PDF: {str(e)}")
            return Response({"error": "Error generando el reporte PDF."}, status=500)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generar_descripcion(self, request):
        try:
            nombre = request.data.get('nombre')
            caracteristicas = request.data.get('caracteristicas', '')
            
            if not nombre:
                return Response({"error": "Falta nombre del producto"}, status=400)
                
            texto = generar_descripcion_ia(nombre, caracteristicas)
            return Response({"descripcion": texto})
        except Exception as e:
            logger.error(f"Error generando descripción IA: {str(e)}")
            return Response({"error": "Servicio de IA no disponible."}, status=503)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def enviar_reporte_email(self, request):
        try:
            email_destino = request.data.get('email')
            nit = request.data.get('nit')
            
            if not email_destino:
                return Response({"error": "Se requiere un email de destino"}, status=400)

            productos = self.get_queryset()
            info_empresa = None
            
            if nit:
                productos = productos.filter(empresa_id=nit)
                if not productos.exists():
                    try:
                        empresa = EmpresaModel.objects.get(nit=nit)
                        info_empresa = {
                            'nombre': empresa.nombre,
                            'nit': empresa.nit,
                            'direccion': empresa.direccion,
                            'telefono': empresa.telefono
                        }
                    except EmpresaModel.DoesNotExist:
                        pass

            pdf_buffer = generar_pdf_inventario(productos, info_empresa_backup=info_empresa)
            
            pdf_content = pdf_buffer.getvalue()
            pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')

            resend_api_key = config('RESEND_API_KEY', default='')
            sender_email = config('RESEND_FROM_EMAIL', default='') 

            if not resend_api_key:
                 return Response({"message": "Correo simulado (Falta API Key)"})

            url = "https://api.resend.com/emails"
            html_body = get_email_template(email_destino)

            payload = {
                "from": f"Lite Thinking <{sender_email}>",
                "to": [email_destino],
                "subject": "Reporte de Inventario - Lite Thinking",
                "html": html_body,
                "attachments": [
                    {
                        "content": pdf_base64,
                        "filename": "inventario.pdf",
                        "type": "application/pdf"
                    }
                ]
            }
            
            headers = {
                "Authorization": f"Bearer {resend_api_key}",
                "Content-Type": "application/json"
            }

            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                return Response({"message": "Correo enviado exitosamente", "id": response.json().get('id')})
            else:
                return Response({"error": f"Error en Resend: {response.text}"}, status=400)
        
        except Exception as e:
            logger.error(f"Error enviando email: {str(e)}")
            return Response({"error": "Error enviando el correo electrónico."}, status=500)


class SystemViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = SystemStatusSerializer

    def list(self, request):
        status_data = {
            "api": "Lite Thinking Backend",
            "version": "1.0.0",
            "status": "Online",
            "database": "Checking..."
        }
        status_code = 200

        try:
            with connection.cursor() as cursor:
                cursor.execute("SELECT 1")
            status_data["database"] = "Connected"
        except Exception as e:
            logger.error(f"Health Check Fallido: {str(e)}")
            status_data["database"] = "Disconnected"
            status_data["error"] = str(e)
            status_code = 503

        serializer = self.get_serializer(status_data)
        return Response(serializer.data, status=status_code)