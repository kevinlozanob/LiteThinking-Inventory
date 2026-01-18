from typing import List, Optional
from core_domain.entities.empresa import Empresa as EmpresaEntity
from core_domain.ports.repositories import EmpresaRepository
from .models import EmpresaModel

class DjangoEmpresaRepository(EmpresaRepository):
    """
    Esta clase es el PUENTE.
    El Dominio pide guardar una 'EmpresaEntity'.
    Django me pide guardar un 'EmpresaModel'.
    Aquí hago la conversión.
    """

    def save(self, empresa: EmpresaEntity) -> EmpresaEntity:
        # Uso update_or_create para manejar "Guardar o Actualizar" de forma eficiente
        obj, created = EmpresaModel.objects.update_or_create(
            nit=empresa.nit,
            defaults={
                'nombre': empresa.nombre,
                'direccion': empresa.direccion,
                'telefono': empresa.telefono
            }
        )
        # RETORNO: Convertimos de vuelta a Entidad pura para que el Dominio no me devuelva undefined
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