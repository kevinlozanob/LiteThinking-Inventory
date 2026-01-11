from dataclasses import dataclass
from typing import Optional

@dataclass
class Empresa:
    nit: str
    nombre: str
    direccion: str
    telefono: str

    def __post_init__(self):
        if not self.nit:
            raise ValueError("El NIT es obligatorio para una empresa")