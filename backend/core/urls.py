from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, ProductoViewSet, SystemViewSet

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'system', SystemViewSet, basename='system')

urlpatterns = [
    path('', include(router.urls)),
]