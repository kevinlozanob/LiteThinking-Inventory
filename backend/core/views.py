from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated, AllowAny
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse
from django.db import connection

from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer, SystemStatusSerializer

from .reports import generar_pdf_inventario   
from .ai import generar_descripcion_ia     
from .permissions import IsAdminOrReadOnly   

from .utils import get_email_template

import requests 
import base64   
from decouple import config 

# --------------------------------------

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = EmpresaModel.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAdminOrReadOnly]
    lookup_value_regex = '[^/]+'
class ProductoViewSet(viewsets.ModelViewSet):
    queryset = ProductoModel.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAdminOrReadOnly]

    # Endpoint para bajar PDF
    @action(detail=False, methods=['get'])
    def descargar_reporte(self, request):
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

    @action(detail=False, methods=['post'])
    def generar_descripcion(self, request):
        nombre = request.data.get('nombre')
        caracteristicas = request.data.get('caracteristicas', '')
        
        if not nombre:
            return Response({"error": "Falta nombre del producto"}, status=400)
            
        texto = generar_descripcion_ia(nombre, caracteristicas)
        return Response({"descripcion": texto})
    
    @action(detail=False, methods=['post'], permission_classes=[IsAuthenticated])
    def enviar_reporte_email(self, request):
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
             print(f"MOCK EMAIL TO: {email_destino}")
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

        try:
            response = requests.post(url, json=payload, headers=headers)
            
            if response.status_code == 200:
                return Response({"message": "Correo enviado exitosamente", "id": response.json().get('id')})
            else:
                return Response({"error": f"Error en Resend: {response.text}"}, status=400)
                
        except Exception as e:
            return Response({"error": str(e)}, status=500)
                
        except Exception as e:
            return Response({"error": str(e)}, status=500)
class SystemViewSet(viewsets.GenericViewSet):
    permission_classes = [AllowAny]
    serializer_class = SystemStatusSerializer

    def list(self, request):
        """
        Retorna el estado del sistema y la conexión a la base de datos.
        """
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
            status_data["database"] = "Disconnected"
            status_data["error"] = str(e)
            status_code = 503

        serializer = self.get_serializer(status_data)
        return Response(serializer.data, status=status_code)