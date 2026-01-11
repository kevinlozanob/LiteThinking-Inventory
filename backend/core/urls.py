from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, ProductoViewSet

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]