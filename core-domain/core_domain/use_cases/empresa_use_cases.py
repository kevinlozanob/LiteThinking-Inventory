from typing import List
from ..entities.empresa import Empresa
from ..ports.repositories import EmpresaRepository
from ..exceptions import EntityValidationError, BusinessRuleError, InfrastructureError, ResourceNotFoundError

class CrearEmpresaUseCase:
    def __init__(self, repository: EmpresaRepository):
        # INYECCIÓN DE DEPENDENCIA:
        self.repository = repository

    def execute(self, nit: str, nombre: str, direccion: str, telefono: str) -> Empresa:
        try:
            # 1. Valido Datos = USO ENTIDAD
            try:
                empresa = Empresa(nit=nit, nombre=nombre, direccion=direccion, telefono=telefono)
            except ValueError as e:
                # Try Catch para datos inválidos, en Python Try Except
                raise EntityValidationError(f"Datos inválidos: {str(e)}")

            # 2. Validar Reglas de Negocio (¿Ya existe?)
            if self.repository.get_by_nit(nit):
                raise BusinessRuleError(f"Ya existe una empresa con el NIT {nit}")

            return self.repository.save(empresa)

        except (EntityValidationError, BusinessRuleError) as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error guardando empresa: {str(e)}")

class ActualizarEmpresaUseCase:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self, nit: str, nombre: str, direccion: str, telefono: str) -> Empresa:
        try:
            # 1. Regla de Negocio: Debe existir para actualizarse
            if not self.repository.get_by_nit(nit):
                raise ResourceNotFoundError(f"La empresa con NIT {nit} no existe")

            # 2. Validar datos
            try:
                empresa = Empresa(nit=nit, nombre=nombre, direccion=direccion, telefono=telefono)
            except ValueError as e:
                raise EntityValidationError(f"Datos inválidos: {str(e)}")

            return self.repository.save(empresa)
        except (ResourceNotFoundError, EntityValidationError) as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error actualizando empresa: {str(e)}")

class ObtenerEmpresaPorNitUseCase:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self, nit: str) -> Empresa:
        try:
            empresa = self.repository.get_by_nit(nit)
            if not empresa:
                raise ResourceNotFoundError(f"No se encontró la empresa con NIT {nit}")
            return empresa
        except ResourceNotFoundError as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error consultando empresa: {str(e)}")

class ListarEmpresasUseCase:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self) -> List[Empresa]:
        try:
            return self.repository.list_all()
        except Exception as e:
            raise InfrastructureError(f"Error consultando empresas: {str(e)}")

class EliminarEmpresaUseCase:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self, nit: str) -> None:
        try:
            if not self.repository.get_by_nit(nit):
                raise ResourceNotFoundError(f"La empresa con NIT {nit} no existe")
            self.repository.delete(nit)
        except ResourceNotFoundError as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error eliminando empresa: {str(e)}")