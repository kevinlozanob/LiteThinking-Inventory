from decouple import config
from .adapters import DjangoEmpresaRepository, DjangoProductoRepository

# =============================================================================
# --- INYECTORES DE PRODUCCIÓN  ---
# Esta es la configuración por defecto para que funcione con la BD.
# =============================================================================

def get_empresa_repository():
    """
    Retorna el repositorio de empresas configurado (PostgreSQL).
    """
    return DjangoEmpresaRepository()

def get_producto_repository():
    """
    Retorna el repositorio de productos configurado (PostgreSQL).
    """
    return DjangoProductoRepository()

































# =============================================================================
# --- ZONA DE PRUEBAS DE ARQUITECTURA  ---
# INSTRUCCIONES:
# 1. Descomentar todo el bloque de abajo (Ctrl + /).
# 2. Configurar en .env: DB_ENGINE=fake
# 3. Reiniciar backend.
# =============================================================================

# from core_domain.entities.empresa import Empresa
# from core_domain.entities.producto import Producto

# # --- 1. MOCK DE EMPRESAS (Datos en RAM) ---
# class FakeEmpresaRepository:
#     def list_all(self):
#         return [
#             Empresa(
#                 nit="900000000-1", 
#                 nombre=">>> EMPRESA MOCK (RAM) <<<", 
#                 direccion="Servidor en Memoria", 
#                 telefono="3001234567"
#             )
#         ]
#     def save(self, e): return e
#     def get_by_nit(self, n): 
#         # Retornamos la primera de la lista para simular éxito
#         return self.list_all()[0]
#     def delete(self, n): pass

# # --- 2. MOCK DE PRODUCTOS (Datos en RAM) ---
# class FakeProductoRepository:
#     def list_by_empresa(self, nit):
#         # Solo devuelve productos si el NIT coincide con la empresa Mock
#         if nit == "900000000-1":
#             p1 = Producto(codigo="MOCK-001", nombre="Producto Desacoplado A", caracteristicas="Datos vivos en RAM", empresa_nit=nit, precios={"USD": 100})
#             p1.id = 111 # ID Falso para el frontend
#             p2 = Producto(codigo="MOCK-002", nombre="Producto Desacoplado B", caracteristicas="Sin dependencia de Django ORM", empresa_nit=nit, precios={"COP": 500000})
#             p2.id = 222
#             return [p1, p2]
#         return []
    
#     def save(self, p): 
#         p.id = 999 # Simulamos ID generado
#         return p
        
#     def get_by_codigo(self, c): return None
    
#     # Este método es vital para que el UPDATE no falle en la prueba
#     def get_by_id(self, i):
#         p = Producto(codigo="MOCK-EDIT", nombre="Producto Editado en RAM", caracteristicas="Editado", empresa_nit="900000000-1", precios={"USD": 50})
#         p.id = int(i)
#         return p

#     def delete(self, i): pass

# # --- 3. SOBRESCRITURA DE INYECTORES (EL SWITCH) ---

# def get_empresa_repository():
#     if config('DB_ENGINE', default='postgres') == 'fake':
#         return FakeEmpresaRepository()
#     return DjangoEmpresaRepository()

# def get_producto_repository():
#     if config('DB_ENGINE', default='postgres') == 'fake':
#         return FakeProductoRepository()
#     return DjangoProductoRepository()