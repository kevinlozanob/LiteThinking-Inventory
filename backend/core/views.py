from rest_framework import viewsets
from rest_framework.permissions import IsAuthenticatedOrReadOnly, IsAdminUser
from .models import EmpresaModel, ProductoModel
from .serializers import EmpresaSerializer, ProductoSerializer
from django.http import FileResponse # <--- Importar
from rest_framework.decorators import action # <--- Importar
from rest_framework.response import Response # <--- Importar
from .utils import generar_pdf_inventario # <--- Importar

class EmpresaViewSet(viewsets.ModelViewSet):
    queryset = EmpresaModel.objects.all()
    serializer_class = EmpresaSerializer
    
    permission_classes = [IsAuthenticatedOrReadOnly] 

class ProductoViewSet(viewsets.ModelViewSet):
    queryset = ProductoModel.objects.all()
    serializer_class = ProductoSerializer
    permission_classes = [IsAuthenticatedOrReadOnly]
    # GET /api/productos/descargar_reporte/
    @action(detail=False, methods=['get'])
    def descargar_reporte(self, request):
        """
        Genera y descarga un PDF con el inventario actual.
        """
        productos = self.get_queryset()
        buffer = generar_pdf_inventario(productos)
        
        return FileResponse(
            buffer, 
            as_attachment=True, 
            filename='inventario_productos.pdf'
        )