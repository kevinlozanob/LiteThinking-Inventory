from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from dataclasses import asdict 

from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer, SystemStatusSerializer
from .reports import generar_pdf_inventario   
from .ai import generar_descripcion_ia, procesar_audio_con_ia, chat_con_inventario
from .permissions import IsAdminOrReadOnly   
from .utils import get_email_template

# --- IMPORTS DE DOMINIO (CASOS DE USO) ---
from core_domain.use_cases.empresa_use_cases import (
    CrearEmpresaUseCase, 
    ListarEmpresasUseCase,
    ObtenerEmpresaPorNitUseCase,
    ActualizarEmpresaUseCase,
    EliminarEmpresaUseCase
)
from core_domain.use_cases.producto_use_cases import (
    CrearProductoUseCase, 
    ListarProductosPorEmpresaUseCase,
    ObtenerProductoPorIdUseCase,
    ActualizarProductoUseCase,
    EliminarProductoUseCase
)
from core_domain.exceptions import (
    EntityValidationError, 
    BusinessRuleError, 
    InfrastructureError,
    ResourceNotFoundError
)

# Inyectores
from .di import get_empresa_repository, get_producto_repository

import requests 
import base64   
import logging
from decouple import config 

logger = logging.getLogger(__name__)

def preparar_respuesta(entidad):
    """
    Convierte la dataclass a diccionario para la respuesta JSON.
    """
    data = asdict(entidad)
    if hasattr(entidad, 'id'):
        data['id'] = entidad.id
    return data

# =========================================================
# EMPRESA VIEWSET
# =========================================================
class EmpresaViewSet(viewsets.GenericViewSet):
    serializer_class = EmpresaSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_value_regex = '[^/]+'
    lookup_field = 'nit'

    def list(self, request, *args, **kwargs):
        try:
            repo = get_empresa_repository()
            use_case = ListarEmpresasUseCase(repo)
            data = [preparar_respuesta(e) for e in use_case.execute()]
            return Response(self.get_serializer(data, many=True).data)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

    def retrieve(self, request, nit=None, *args, **kwargs):
        try:
            repo = get_empresa_repository()
            use_case = ObtenerEmpresaPorNitUseCase(repo)
            
            val = nit or kwargs.get('nit') or kwargs.get('pk')
            empresa = use_case.execute(val)
            
            return Response(self.get_serializer(preparar_respuesta(empresa)).data)
        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            repo = get_empresa_repository()
            use_case = CrearEmpresaUseCase(repo)
            
            res = use_case.execute(
                nit=data.get('nit'), 
                nombre=data.get('nombre'),
                direccion=data.get('direccion'), 
                telefono=data.get('telefono')
            )
            return Response(self.get_serializer(preparar_respuesta(res)).data, status=201)
            
        except (EntityValidationError, BusinessRuleError) as e:
            return Response({"detail": str(e)}, status=400)
        except Exception as e:
            return Response({"detail": f"Error interno: {str(e)}"}, status=500)

    def update(self, request, *args, **kwargs):
        try:
            nit_url = kwargs.get('nit') or kwargs.get('pk')
            
            data = request.data.copy()
            data['nit'] = nit_url 

            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(data=data, partial=partial)
            serializer.is_valid(raise_exception=True)
            validated_data = serializer.validated_data 

            repo = get_empresa_repository()
            use_case = ActualizarEmpresaUseCase(repo)
            
            res = use_case.execute(
                nit=nit_url, 
                nombre=validated_data.get('nombre'),
                direccion=validated_data.get('direccion'), 
                telefono=validated_data.get('telefono')
            )
            return Response(self.get_serializer(preparar_respuesta(res)).data, status=200)
            
        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except (EntityValidationError, BusinessRuleError) as e:
            return Response({"detail": str(e)}, status=400)
        except Exception as e:
            return Response({"detail": f"Error interno: {str(e)}"}, status=500)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, *args, **kwargs):
        try:
            repo = get_empresa_repository()
            use_case = EliminarEmpresaUseCase(repo)
            
            val = kwargs.get('nit') or kwargs.get('pk')
            use_case.execute(val)
            
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except Exception as e:
            return Response({"detail": str(e)}, status=500)


# =========================================================
# PRODUCTO VIEWSET
# =========================================================
class ProductoViewSet(viewsets.GenericViewSet):
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly]
    queryset = ProductoModel.objects.none() 

    def list(self, request, *args, **kwargs):
        try:
            nit = request.query_params.get('empresa')
            if not nit: return Response({"error": "?empresa=NIT requerido"}, status=400)
            
            repo = get_producto_repository()
            use_case = ListarProductosPorEmpresaUseCase(repo)
            
            data = [preparar_respuesta(p) for p in use_case.execute(nit)]
            return Response(self.get_serializer(data, many=True).data)
        except Exception as e:
            logger.error(f"Error List: {e}")
            return Response({"error": str(e)}, status=500)

    def retrieve(self, request, pk=None, *args, **kwargs):
        try:
            repo = get_producto_repository()
            use_case = ObtenerProductoPorIdUseCase(repo)
            prod = use_case.execute(pk)
            return Response(self.get_serializer(preparar_respuesta(prod)).data)
        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    def create(self, request, *args, **kwargs):
        try:
            serializer = self.get_serializer(data=request.data)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data
            
            repo = get_producto_repository()
            use_case = CrearProductoUseCase(repo)
            
            prod = use_case.execute(
                codigo=data.get('codigo'), 
                nombre=data.get('nombre'),
                caracteristicas=data.get('caracteristicas'),
                empresa_nit=data.get('empresa_nit'), 
                precios=data.get('precios')
            )
            return Response(self.get_serializer(preparar_respuesta(prod)).data, status=201)
        except (EntityValidationError, ValueError) as e:
             return Response({"detail": str(e)}, status=400)
        except Exception as e:
            logger.error(f"Error Create: {e}")
            return Response({"detail": str(e)}, status=400)

    def update(self, request, *args, **kwargs):
        try:
            pk = kwargs.get('pk') 
            
            repo = get_producto_repository()
            use_case_get = ObtenerProductoPorIdUseCase(repo)
            current_prod = use_case_get.execute(pk)

            partial = kwargs.pop('partial', False)
            serializer = self.get_serializer(data=request.data, partial=partial)
            serializer.is_valid(raise_exception=True)
            data = serializer.validated_data

            use_case_update = ActualizarProductoUseCase(repo)
            
            new_empresa_nit = data.get('empresa_nit') or current_prod.empresa_nit

            prod = use_case_update.execute(
                id_producto=pk,
                codigo=data.get('codigo', current_prod.codigo),
                nombre=data.get('nombre', current_prod.nombre),
                caracteristicas=data.get('caracteristicas', current_prod.caracteristicas),
                empresa_nit=new_empresa_nit,
                precios=data.get('precios', current_prod.precios)
            )
            return Response(self.get_serializer(preparar_respuesta(prod)).data, status=200)

        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except Exception as e:
            logger.error(f"Error Update: {e}")
            return Response({"detail": str(e)}, status=400)

    def partial_update(self, request, *args, **kwargs):
        kwargs['partial'] = True
        return self.update(request, *args, **kwargs)

    def destroy(self, request, pk=None, *args, **kwargs):
        try:
            repo = get_producto_repository()
            use_case = EliminarProductoUseCase(repo)
            use_case.execute(pk)
            return Response(status=status.HTTP_204_NO_CONTENT)
        except ResourceNotFoundError as e:
            return Response({"detail": str(e)}, status=404)
        except Exception as e:
            return Response({"error": str(e)}, status=500)

    # --- ACTIONS EXTRAS ---
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def chat_inventario(self, request):
        try:
            nit = request.data.get('nit')
            historial = request.data.get('historial')
            repo = get_producto_repository()
            use_case = ListarProductosPorEmpresaUseCase(repo)
            productos = use_case.execute(nit)
            datos = [{"n": p.nombre, "p": p.precios, "cod": p.codigo, "c": p.caracteristicas} for p in productos]
            rta = chat_con_inventario(historial, datos)
            return Response({"respuesta": rta})
        except: return Response({"error": "IA Off"}, status=503)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def interpretar_voz(self, request):
        try:
            f = request.FILES.get('audio')
            return Response(procesar_audio_con_ia(f) or {"error": "N/A"})
        except: return Response({"error": "Error"}, 500)

    @action(detail=False, methods=['get'])
    def descargar_reporte(self, request):
        try:
            nit = request.query_params.get('empresa')
            repo_prod = get_producto_repository()
            repo_emp = get_empresa_repository()
            
            entities = repo_prod.list_by_empresa(nit) if nit else []
            emp_entity = repo_emp.get_by_nit(nit) if nit else None
            
            class MockObj:
                def __init__(self, **kw): self.__dict__.update(kw)
            
            nombre_emp = emp_entity.nombre if emp_entity else "EMPRESA"
            prods_mapped = [
                MockObj(
                    codigo=p.codigo, 
                    nombre=p.nombre, 
                    caracteristicas=p.caracteristicas, 
                    precios=p.precios, 
                    empresa=MockObj(nombre=nombre_emp)
                ) for p in entities
            ]
            
            info = {
                'nombre': emp_entity.nombre if emp_entity else 'N/A',
                'nit': emp_entity.nit if emp_entity else 'N/A',
                'direccion': emp_entity.direccion if emp_entity else 'N/A',
                'telefono': emp_entity.telefono if emp_entity else 'N/A'
            }
            
            buffer = generar_pdf_inventario(prods_mapped, info)
            return FileResponse(buffer, as_attachment=True, filename='inventario.pdf')
        except Exception as e:
            return Response({"error": str(e)}, 500)

    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def generar_descripcion(self, request):
        try:
            nombre = request.data.get('nombre')
            texto = generar_descripcion_ia(nombre, "Generar venta")
            return Response({"descripcion": texto})
        except Exception as e:
            return Response({"error": "IA Error"}, status=503)
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def enviar_reporte_email(self, request):
        try:
            email_destino = request.data.get('email')
            nit = request.data.get('nit')
            if not email_destino: return Response({"error": "Falta email"}, status=400)

            repo_prod = get_producto_repository()
            repo_emp = get_empresa_repository()
            
            entities = repo_prod.list_by_empresa(nit) if nit else []
            emp_entity = repo_emp.get_by_nit(nit) if nit else None

            class MockObj:
                def __init__(self, **kw): self.__dict__.update(kw)
            
            nombre_emp = emp_entity.nombre if emp_entity else "EMPRESA"
            prods_mapped = [
                MockObj(
                    codigo=p.codigo, 
                    nombre=p.nombre, 
                    caracteristicas=p.caracteristicas, 
                    precios=p.precios, 
                    empresa=MockObj(nombre=nombre_emp)
                ) for p in entities
            ]
            
            info = {
                'nombre': emp_entity.nombre if emp_entity else 'N/A',
                'nit': emp_entity.nit if emp_entity else 'N/A',
                'direccion': emp_entity.direccion if emp_entity else 'N/A',
                'telefono': emp_entity.telefono if emp_entity else 'N/A'
            }

            pdf_buffer = generar_pdf_inventario(prods_mapped, info)
            pdf_content = pdf_buffer.getvalue()
            pdf_b64 = base64.b64encode(pdf_content).decode('utf-8')
            
            resend_api_key = config('RESEND_API_KEY', default='')
            sender_email = config('RESEND_FROM_EMAIL', default='')

            if not resend_api_key: return Response({"message": "Correo simulado (Falta API Key)"})

            url = "https://api.resend.com/emails"
            html_body = get_email_template(email_destino)
            
            payload = {
                "from": f"Lite Thinking <{sender_email}>",
                "to": [email_destino],
                "subject": "Reporte de Inventario - Lite Thinking",
                "html": html_body,
                "attachments": [{"content": pdf_b64, "filename": "inventario.pdf", "type": "application/pdf"}]
            }
            
            headers = {"Authorization": f"Bearer {resend_api_key}", "Content-Type": "application/json"}
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                return Response({"message": "Correo enviado", "id": response.json().get('id')}, status=200)
            else:
                return Response({"error": f"Error Resend: {response.text}"}, status=400)
        
        except Exception as e:
            return Response({"error": "Error envío"}, status=500)


class SystemViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = SystemStatusSerializer

    def list(self, request):
        return Response({
            "api": "Lite Thinking Backend",
            "version": "1.0.0", 
            "status": "Online",
            "database": "Connected"
        })