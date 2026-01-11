from django.db import models
from django.core.exceptions import ValidationError
from core_domain.entities.empresa import Empresa as EmpresaEntity
from core_domain.entities.producto import Producto as ProductoEntity

class EmpresaModel(models.Model):
    nit = models.CharField(max_length=50, primary_key=True, verbose_name="NIT")
    nombre = models.CharField(max_length=255, verbose_name="Nombre de la Empresa")
    direccion = models.CharField(max_length=255, verbose_name="Dirección")
    telefono = models.CharField(max_length=20, verbose_name="Teléfono")

    class Meta:
        verbose_name = "Empresa"
        verbose_name_plural = "Empresas"
        db_table = "empresas"

    def save(self, *args, **kwargs):
        try:
            EmpresaEntity(
                nit=self.nit,
                nombre=self.nombre,
                direccion=self.direccion,
                telefono=self.telefono
            )
        except ValueError as e:
            raise ValidationError(str(e))
            
        super().save(*args, **kwargs)

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

    def save(self, *args, **kwargs):
        try:
            ProductoEntity(
                codigo=self.codigo,
                nombre=self.nombre,
                caracteristicas=self.caracteristicas,
                empresa_nit=self.empresa_id, # Usamos el ID, no el objeto Django
                precios=self.precios
            )
        except ValueError as e:
            raise ValidationError(str(e))
            
        super().save(*args, **kwargs)

    def __str__(self):
        return self.nombre