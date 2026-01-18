class DomainError(Exception):
    """Clase padre para todos los errores de negocio."""
    pass

class EntityValidationError(DomainError):
    """Error cuando los datos (NIT, Email, Precio) están mal formados."""
    pass

class BusinessRuleError(DomainError):
    """Error cuando se rompe una regla (ej: Empresa ya existe)."""
    pass

class ResourceNotFoundError(DomainError):
    """Error cuando se busca algo y no existe."""
    pass

class InfrastructureError(DomainError):
    """Error crítico de base de datos o sistemas externos."""
    pass