from typing import List, Optional
from core_domain.entities.empresa import Empresa as EmpresaEntity
from core_domain.entities.producto import Producto as ProductoEntity
from core_domain.ports.repositories import EmpresaRepository, ProductoRepository
from .models import EmpresaModel, ProductoModel

# --- ADAPTADOR EMPRESA ---
class DjangoEmpresaRepository(EmpresaRepository):
    def save(self, empresa: EmpresaEntity) -> EmpresaEntity:
        obj, created = EmpresaModel.objects.update_or_create(
            nit=empresa.nit,
            defaults={
                'nombre': empresa.nombre,
                'direccion': empresa.direccion,
                'telefono': empresa.telefono
            }
        )
        return self._to_entity(obj)

    def get_by_nit(self, nit: str) -> Optional[EmpresaEntity]:
        try:
            obj = EmpresaModel.objects.get(nit=nit)
            return self._to_entity(obj)
        except EmpresaModel.DoesNotExist:
            return None

    def list_all(self) -> List[EmpresaEntity]:
        qs = EmpresaModel.objects.all()
        return [self._to_entity(obj) for obj in qs]

    def delete(self, nit: str) -> None:
        EmpresaModel.objects.filter(nit=nit).delete()

    def _to_entity(self, model: EmpresaModel) -> EmpresaEntity:
        return EmpresaEntity(
            nit=model.nit,
            nombre=model.nombre,
            direccion=model.direccion,
            telefono=model.telefono
        )

# --- ADAPTADOR PRODUCTO ---
class DjangoProductoRepository(ProductoRepository):
    def save(self, producto: ProductoEntity) -> ProductoEntity:
        try:
            empresa_model = EmpresaModel.objects.get(nit=producto.empresa_nit)
        except EmpresaModel.DoesNotExist:
            raise ValueError(f"Empresa {producto.empresa_nit} no encontrada.")

        obj, created = ProductoModel.objects.update_or_create(
            codigo=producto.codigo,
            defaults={
                'nombre': producto.nombre,
                'caracteristicas': producto.caracteristicas,
                'empresa': empresa_model,
                'precios': producto.precios
            }
        )
        return self._to_entity(obj)

    def get_by_codigo(self, codigo: str) -> Optional[ProductoEntity]:
        try:
            obj = ProductoModel.objects.get(codigo=codigo)
            return self._to_entity(obj)
        except ProductoModel.DoesNotExist:
            return None

    def get_by_id(self, id_producto: int) -> Optional[ProductoEntity]:
        try:
            obj = ProductoModel.objects.get(id=id_producto)
            return self._to_entity(obj)
        except ProductoModel.DoesNotExist:
            return None

    def list_by_empresa(self, nit_empresa: str) -> List[ProductoEntity]:
        qs = ProductoModel.objects.filter(empresa_id=nit_empresa)
        return [self._to_entity(obj) for obj in qs]

    def delete(self, id_producto: int) -> None:
        ProductoModel.objects.filter(id=id_producto).delete()

    def _to_entity(self, model: ProductoModel) -> ProductoEntity:
        entity = ProductoEntity(
            codigo=model.codigo,
            nombre=model.nombre,
            caracteristicas=model.caracteristicas,
            empresa_nit=model.empresa_id,
            precios=model.precios
        )
        entity.id = model.id 
        return entity