from django.contrib import admin
from .models import EmpresaModel, ProductoModel

@admin.register(EmpresaModel)
class EmpresaAdmin(admin.ModelAdmin):
    list_display = ('nit', 'nombre', 'telefono')
    search_fields = ('nombre', 'nit')

@admin.register(ProductoModel)
class ProductoAdmin(admin.ModelAdmin):
    list_display = ('codigo', 'nombre', 'empresa')
    list_filter = ('empresa',)
    search_fields = ('nombre', 'codigo')