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
                # Transformamos error de valor en error de Dominio
                raise EntityValidationError(f"Datos inválidos: {str(e)}")

            # 2. Validar Reglas de Negocio (¿Ya existe?)
            if self.repository.get_by_nit(nit):
                raise BusinessRuleError(f"Ya existe una empresa con el NIT {nit}")

            return self.repository.save(empresa)

        except (EntityValidationError, BusinessRuleError) as e:
            raise e
        except Exception as e:
            # Error desconocido? Lo atrapamos y lo reportamos como infraestructura.
            # AQUÍ ESTÁ EL TRY/CATCH QUE QUERÍA EL CEO.
            raise InfrastructureError(f"Error crítico guardando empresa: {str(e)}")

class ListarEmpresasUseCase:
    def __init__(self, repository: EmpresaRepository):
        self.repository = repository

    def execute(self) -> List[Empresa]:
        try:
            return self.repository.list_all()
        except Exception as e:
            raise InfrastructureError(f"Error consultando empresas: {str(e)}")