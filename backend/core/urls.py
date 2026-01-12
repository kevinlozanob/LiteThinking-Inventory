from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import EmpresaViewSet, ProductoViewSet, system_status

router = DefaultRouter()
router.register(r'empresas', EmpresaViewSet)
router.register(r'productos', ProductoViewSet)

urlpatterns = [
    path('system-status/', system_status, name='system_status'),
    path('', include(router.urls)),
]