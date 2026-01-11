from django.db import models

class EmpresaModel(models.Model):

    nit = models.CharField(max_length=50, primary_key=True, verbose_name="NIT")
    nombre = models.CharField(max_length=255, verbose_name="Nombre de la Empresa")
    direccion = models.CharField(max_length=255, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono")

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        db_table = "empresas"

    def __str__(self):
        return f"{self.nombre} ({self.nit})"


class ProductoModel(models.Model):

    codigo = models.CharField(max_length=50, unique=True, verbose_name="Código")
    nombre = models.CharField(max_length=255, verbose_name="Nombre del Producto")
    caracteristicas = models.TextField(verbose_name="Características")
    
    empresa = models.ForeignKey(
        EmpresaModel, 
        on_delete=models.CASCADE, 
        related_name='productos',
        verbose_name="Empresa"
    )


    precios = models.JSONField(
        default=dict, 
        verbose_name="Precios (Moneda -> Valor)",
        help_text="Formato: {'USD': 100, 'COP': 400000}"
    )

    class Meta:
        verbose_name = "Producto"
        verbose_name_plural = "Productos"
        db_table = "productos"

    def __str__(self):
        return self.nombre