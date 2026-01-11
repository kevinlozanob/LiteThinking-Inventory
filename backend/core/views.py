from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly
from rest_framework.decorators import action
from rest_framework.response import Response
from django.http import FileResponse

from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer


from .reports import generar_pdf_inventario   
from .ai import generar_descripcion_ia     

from .permissions import IsAdminOrReadOnly   
# --------------------------------------

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = EmpresaModel.objects.all()
    serializer_class = EmpresaSerializer
    permission_classes = [IsAdminOrReadOnly] 

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