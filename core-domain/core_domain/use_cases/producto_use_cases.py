from typing import List
from ..entities.producto import Producto
from ..ports.repositories import ProductoRepository
from ..exceptions import InfrastructureError

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
            raise e
        except Exception as e:
            raise InfrastructureError(f"Error guardando producto: {str(e)}")

class ListarProductosPorEmpresaUseCase:
    def __init__(self, repository: ProductoRepository):
        self.repository = repository

    def execute(self, nit_empresa: str) -> List[Producto]:
        try:
            return self.repository.list_by_empresa(nit_empresa)
        except Exception as e:
            raise InfrastructureError(f"Error consultando productos: {str(e)}")