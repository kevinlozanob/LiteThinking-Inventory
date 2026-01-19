from typing import List
from ..entities.producto import Producto
from ..ports.repositories import ProductoRepository
from ..exceptions import InfrastructureError, ResourceNotFoundError, EntityValidationError

class CrearProductoUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, codigo: str, nombre: str, caracteristicas: str, empresa_nit: str, precios: dict) -> Producto:
        try:
            producto = Producto(
                codigo=codigo,
                nombre=nombre,
                caracteristicas=caracteristicas,
                empresa_nit=empresa_nit,
                precios=precios
            )
            return self.repository.save(producto)
        except ValueError as e:
            raise EntityValidationError(f"Datos de producto inválidos: {str(e)}")
        except Exception as e:
            raise InfrastructureError(f"Error guardando producto: {str(e)}")

class ActualizarProductoUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, id_producto: int, codigo: str, nombre: str, caracteristicas: str, empresa_nit: str, precios: dict) -> Producto:
        try:
            producto_existente = self.repository.get_by_id(id_producto)
            if not producto_existente:
                raise ResourceNotFoundError(f"El producto con ID {id_producto} no existe")

            # Crear entidad con datos nuevos
            producto = Producto(
                codigo=codigo,
                nombre=nombre,
                caracteristicas=caracteristicas,
                empresa_nit=empresa_nit,
                precios=precios
            )
            return self.repository.save(producto)
        except (ResourceNotFoundError, ValueError) as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error actualizando producto: {str(e)}")

class ObtenerProductoPorIdUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, id_producto: int) -> Producto:
        try:
            producto = self.repository.get_by_id(id_producto)
            if not producto:
                raise ResourceNotFoundError(f"Producto {id_producto} no encontrado")
            return producto
        except ResourceNotFoundError as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error consultando producto: {str(e)}")

class ListarProductosPorEmpresaUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, nit_empresa: str) -> List[Producto]:
        try:
            return self.repository.list_by_empresa(nit_empresa)
        except Exception as e:
            raise InfrastructureError(f"Error consultando productos: {str(e)}")

class EliminarProductoUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, id_producto: int) -> None:
        try:
            if not self.repository.get_by_id(id_producto):
                raise ResourceNotFoundError(f"Producto {id_producto} no existe")
            self.repository.delete(id_producto)
        except ResourceNotFoundError as e:
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error eliminando producto: {str(e)}")