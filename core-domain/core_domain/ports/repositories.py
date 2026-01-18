from abc import ABC, abstractmethod
from typing import List, Optional
from ..entities.empresa import Empresa
from ..entities.producto import Producto

class EmpresaRepository(ABC):
    """
    Contrato que cualquier base de datos (Django, FastAPI, SQL, Mongo)
    DEBE cumplir para trabajar con Empresas.
    """
    @abstractmethod
    def save(self, empresa: Empresa) -> Empresa:
        pass

    @abstractmethod
    def get_by_nit(self, nit: str) -> Optional[Empresa]:
        pass

    @abstractmethod
    def list_all(self) -> List[Empresa]:
        pass
    
    @abstractmethod
    def delete(self, nit: str) -> None:
        pass

class ProductoRepository(ABC):
    """
    Contrato para trabajar con Productos.
    """
    @abstractmethod
    def save(self, producto: Producto) -> Producto:
        pass

    @abstractmethod
    def get_by_codigo(self, codigo: str) -> Optional[Producto]:
        pass
    
    @abstractmethod
    def list_by_empresa(self, nit_empresa: str) -> List[Producto]:
        pass
        
    @abstractmethod
    def delete(self, id_producto: int) -> None:
        pass