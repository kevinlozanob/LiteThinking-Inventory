from dataclasses import dataclass
from typing import Dict, Optional 
from decimal import Decimal

@dataclass
class Producto:
    codigo: str
    nombre: str
    caracteristicas: str
    empresa_nit: str

    precios: Dict[str, Decimal]
    id: Optional[int] = None 

    def __post_init__(self):
        if not self.codigo:
            raise ValueError("El código del producto es obligatorio")
        if not self.nombre:
            raise ValueError("El nombre del producto es obligatorio")
        if not self.empresa_nit:
            raise ValueError("Todo producto debe estar asociado a una empresa (NIT)")
        if not self.precios:
            raise ValueError("El producto debe tener al menos un precio asignado")

    def obtener_precio(self, moneda: str) -> Decimal:
        if moneda not in self.precios:
            raise ValueError(f"El producto no tiene precio configurado para {moneda}")
        return self.precios[moneda]