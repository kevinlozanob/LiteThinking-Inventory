from dataclasses import dataclass
import re

@dataclass
class Empresa:
    nit: str
    nombre: str
    direccion: str
    telefono: str

    def __post_init__(self):
        
        if not self.nit or not self.nit.strip():
            raise ValueError("El NIT es obligatorio para una empresa")
            
        if not self.nombre or not self.nombre.strip():
            raise ValueError("El nombre de la empresa es obligatorio")
            
        if not self.direccion or not self.direccion.strip():
            raise ValueError("La dirección es obligatoria")

        if not self.telefono or not self.telefono.strip():
            raise ValueError("El teléfono es obligatorio")
        
        if not re.match(r'^[0-9-]+$', self.nit):
            raise ValueError("Formato inválido. El NIT solo debe contener caracteres numéricos y guiones (-).")
        
        tel_limpio = self.telefono.strip()
        
        if len(tel_limpio) < 7:
            raise ValueError("Longitud insuficiente. El teléfono debe tener al menos 7 dígitos.")
        
        if not re.match(r'^\+?[0-9]+$', tel_limpio):
             raise ValueError("Caracteres inválidos. El teléfono solo admite dígitos numéricos (y prefijo +).")