from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAuthenticated 
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse

from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer


from .reports import generar_pdf_inventario   
from .ai import generar_descripcion_ia     
from .permissions import IsAdminOrReadOnly   

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
        productos = self.get_queryset()
        buffer = generar_pdf_inventario(productos)
        return FileResponse(buffer, as_attachment=True, filename='inventario.pdf')

    # Endpoint para AI
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
        
        if not email_destino:
            return Response({"error": "Se requiere un email de destino"}, status=400)

        productos = self.get_queryset()
        pdf_buffer = generar_pdf_inventario(productos)
        
        pdf_content = pdf_buffer.getvalue()
        pdf_base64 = base64.b64encode(pdf_content).decode('utf-8')

        resend_api_key = config('RESEND_API_KEY', default='')
        sender_email = config('RESEND_FROM_EMAIL', default='') 

        if not resend_api_key:
             return Response({"error": "Falta configuración de API Key en servidor"}, status=500)

        url = "https://api.resend.com/emails"
        
        payload = {
            "from": f"Lite Thinking <{sender_email}>",
            "to": [email_destino],
            "subject": "Reporte de Inventario - Lite Thinking",
            "html": "<p>Adjunto encontrarás el reporte actual del inventario generado automáticamente.</p>",
            "attachments": [
                {
                    "content": pdf_base64,
                    "filename": "inventario.pdf",
                    "type": "application/pdf" #,
                    #"disposition": "attachment" 
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