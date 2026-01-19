"""
=============================================================================
PRUEBAS UNITARIAS COMPLETAS - Lite Thinking Inventory System
=============================================================================
Ejecutar con: python -m pytest core/tests.py -v
=============================================================================
"""

import pytest
from decimal import Decimal
from unittest.mock import Mock, MagicMock
from django.test import TestCase
from django.core.exceptions import ValidationError
from rest_framework.exceptions import ValidationError as DRFValidationError

# ============================================================================
# IMPORTS DEL DOMINIO (core-domain)
# ============================================================================
from core_domain.entities.empresa import Empresa
from core_domain.entities.producto import Producto
from core_domain.use_cases.empresa_use_cases import CrearEmpresaUseCase, ListarEmpresasUseCase
from core_domain.use_cases.producto_use_cases import CrearProductoUseCase, ListarProductosPorEmpresaUseCase
from core_domain.exceptions import (
    EntityValidationError, 
    BusinessRuleError, 
    InfrastructureError
)

# ============================================================================
# IMPORTS DE DJANGO (backend)
# ============================================================================
from core.models import EmpresaModel, ProductoModel
from core.serializers import EmpresaSerializer, ProductoSerializer


# ============================================================================
# 1. TESTS DE ENTIDADES DEL DOMINIO
# ============================================================================

class TestEmpresaEntity:
    """Pruebas para la entidad Empresa del dominio."""
    
    def test_crear_empresa_valida(self):
        """✓ Debe crear una empresa con datos válidos."""
        empresa = Empresa(
            nit="900123456-1",
            nombre="Tech Solutions S.A.S",
            direccion="Calle 100 #15-20",
            telefono="3001234567"
        )
        assert empresa.nit == "900123456-1"
        assert empresa.nombre == "Tech Solutions S.A.S"
        assert empresa.direccion == "Calle 100 #15-20"
        assert empresa.telefono == "3001234567"

    def test_empresa_nit_obligatorio(self):
        """✓ Debe fallar si el NIT está vacío."""
        with pytest.raises(ValueError, match="NIT es obligatorio"):
            Empresa(nit="", nombre="Test", direccion="Dir", telefono="3001234567")

    def test_empresa_nit_solo_espacios(self):
        """✓ Debe fallar si el NIT solo tiene espacios."""
        with pytest.raises(ValueError, match="NIT es obligatorio"):
            Empresa(nit="   ", nombre="Test", direccion="Dir", telefono="3001234567")

    def test_empresa_nombre_obligatorio(self):
        """✓ Debe fallar si el nombre está vacío."""
        with pytest.raises(ValueError, match="nombre de la empresa es obligatorio"):
            Empresa(nit="900123456-1", nombre="", direccion="Dir", telefono="3001234567")

    def test_empresa_direccion_obligatoria(self):
        """✓ Debe fallar si la dirección está vacía."""
        with pytest.raises(ValueError, match="dirección es obligatoria"):
            Empresa(nit="900123456-1", nombre="Test", direccion="", telefono="3001234567")

    def test_empresa_telefono_obligatorio(self):
        """✓ Debe fallar si el teléfono está vacío."""
        with pytest.raises(ValueError, match="teléfono es obligatorio"):
            Empresa(nit="900123456-1", nombre="Test", direccion="Dir", telefono="")

    def test_empresa_nit_formato_invalido(self):
        """✓ Debe fallar si el NIT tiene caracteres inválidos."""
        with pytest.raises(ValueError, match="Formato inválido"):
            Empresa(nit="ABC123", nombre="Test", direccion="Dir", telefono="3001234567")

    def test_empresa_nit_con_letras(self):
        """✓ Debe fallar si el NIT contiene letras."""
        with pytest.raises(ValueError, match="Formato inválido"):
            Empresa(nit="900ABC-1", nombre="Test", direccion="Dir", telefono="3001234567")

    def test_empresa_telefono_muy_corto(self):
        """✓ Debe fallar si el teléfono tiene menos de 7 dígitos."""
        with pytest.raises(ValueError, match="Longitud insuficiente"):
            Empresa(nit="900123456-1", nombre="Test", direccion="Dir", telefono="123456")

    def test_empresa_telefono_caracteres_invalidos(self):
        """✓ Debe fallar si el teléfono tiene caracteres inválidos."""
        with pytest.raises(ValueError, match="Caracteres inválidos"):
            Empresa(nit="900123456-1", nombre="Test", direccion="Dir", telefono="300-123-ABC")

    def test_empresa_telefono_con_prefijo_internacional(self):
        """✓ Debe aceptar teléfonos con prefijo + internacional."""
        empresa = Empresa(
            nit="900123456-1",
            nombre="Test",
            direccion="Dir",
            telefono="+573001234567"
        )
        assert empresa.telefono == "+573001234567"

    def test_empresa_nit_solo_numeros(self):
        """✓ Debe aceptar NIT solo con números."""
        empresa = Empresa(
            nit="900123456",
            nombre="Test",
            direccion="Dir",
            telefono="3001234567"
        )
        assert empresa.nit == "900123456"


class TestProductoEntity:
    """Pruebas para la entidad Producto del dominio."""

    def test_crear_producto_valido(self):
        """✓ Debe crear un producto con datos válidos."""
        producto = Producto(
            codigo="PROD-001",
            nombre="Laptop HP",
            caracteristicas="Core i7, 16GB RAM",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("999.99"), "COP": Decimal("4000000")}
        )
        assert producto.codigo == "PROD-001"
        assert producto.nombre == "Laptop HP"
        assert producto.empresa_nit == "900123456-1"
        assert producto.precios["USD"] == Decimal("999.99")

    def test_producto_codigo_obligatorio(self):
        """✓ Debe fallar si el código está vacío."""
        with pytest.raises(ValueError, match="código del producto es obligatorio"):
            Producto(
                codigo="",
                nombre="Test",
                caracteristicas="Test",
                empresa_nit="900123456-1",
                precios={"USD": Decimal("100")}
            )

    def test_producto_nombre_obligatorio(self):
        """✓ Debe fallar si el nombre está vacío."""
        with pytest.raises(ValueError, match="nombre del producto es obligatorio"):
            Producto(
                codigo="PROD-001",
                nombre="",
                caracteristicas="Test",
                empresa_nit="900123456-1",
                precios={"USD": Decimal("100")}
            )

    def test_producto_empresa_nit_obligatorio(self):
        """✓ Debe fallar si el NIT de empresa está vacío."""
        with pytest.raises(ValueError, match="debe estar asociado a una empresa"):
            Producto(
                codigo="PROD-001",
                nombre="Test",
                caracteristicas="Test",
                empresa_nit="",
                precios={"USD": Decimal("100")}
            )

    def test_producto_precios_obligatorio(self):
        """✓ Debe fallar si no tiene precios."""
        with pytest.raises(ValueError, match="debe tener al menos un precio"):
            Producto(
                codigo="PROD-001",
                nombre="Test",
                caracteristicas="Test",
                empresa_nit="900123456-1",
                precios={}
            )

    def test_producto_obtener_precio_existente(self):
        """✓ Debe retornar el precio correcto para una moneda."""
        producto = Producto(
            codigo="PROD-001",
            nombre="Test",
            caracteristicas="Test",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("150"), "EUR": Decimal("140")}
        )
        assert producto.obtener_precio("USD") == Decimal("150")
        assert producto.obtener_precio("EUR") == Decimal("140")

    def test_producto_obtener_precio_inexistente(self):
        """✓ Debe fallar al obtener precio de moneda no configurada."""
        producto = Producto(
            codigo="PROD-001",
            nombre="Test",
            caracteristicas="Test",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("100")}
        )
        with pytest.raises(ValueError, match="no tiene precio configurado para COP"):
            producto.obtener_precio("COP")

    def test_producto_multiple_monedas(self):
        """✓ Debe soportar múltiples monedas."""
        producto = Producto(
            codigo="PROD-001",
            nombre="Test",
            caracteristicas="Test",
            empresa_nit="900123456-1",
            precios={
                "USD": Decimal("100"),
                "COP": Decimal("400000"),
                "EUR": Decimal("90"),
                "MXN": Decimal("1800")
            }
        )
        assert len(producto.precios) == 4


# ============================================================================
# 2. TESTS DE CASOS DE USO
# ============================================================================

class TestCrearEmpresaUseCase:
    """Pruebas para el caso de uso CrearEmpresa."""

    def test_crear_empresa_exitoso(self):
        """✓ Debe crear empresa cuando no existe."""
        mock_repo = Mock()
        mock_repo.get_by_nit.return_value = None
        mock_repo.save.return_value = Empresa(
            nit="900123456-1",
            nombre="Nueva Empresa",
            direccion="Calle 1",
            telefono="3001234567"
        )
        
        use_case = CrearEmpresaUseCase(mock_repo)
        resultado = use_case.execute(
            nit="900123456-1",
            nombre="Nueva Empresa",
            direccion="Calle 1",
            telefono="3001234567"
        )
        
        assert resultado.nit == "900123456-1"
        assert resultado.nombre == "Nueva Empresa"
        mock_repo.save.assert_called_once()

    def test_crear_empresa_ya_existe(self):
        """✓ Debe fallar si la empresa ya existe (regla de negocio)."""
        mock_repo = Mock()
        mock_repo.get_by_nit.return_value = Empresa(
            nit="900123456-1",
            nombre="Existente",
            direccion="Dir",
            telefono="3001234567"
        )
        
        use_case = CrearEmpresaUseCase(mock_repo)
        
        with pytest.raises(BusinessRuleError, match="Ya existe una empresa"):
            use_case.execute(
                nit="900123456-1",
                nombre="Nueva",
                direccion="Dir",
                telefono="3001234567"
            )

    def test_crear_empresa_datos_invalidos(self):
        """✓ Debe fallar con datos inválidos (validación de entidad)."""
        mock_repo = Mock()
        use_case = CrearEmpresaUseCase(mock_repo)
        
        with pytest.raises(EntityValidationError, match="Datos inválidos"):
            use_case.execute(
                nit="INVALIDO-ABC",
                nombre="Test",
                direccion="Dir",
                telefono="3001234567"
            )

    def test_crear_empresa_error_infraestructura(self):
        """✓ Debe manejar errores de infraestructura."""
        mock_repo = Mock()
        mock_repo.get_by_nit.return_value = None
        mock_repo.save.side_effect = Exception("Database connection failed")
        
        use_case = CrearEmpresaUseCase(mock_repo)
        
        with pytest.raises(InfrastructureError, match="Error crítico"):
            use_case.execute(
                nit="900123456-1",
                nombre="Test",
                direccion="Dir",
                telefono="3001234567"
            )


class TestListarEmpresasUseCase:
    """Pruebas para el caso de uso ListarEmpresas."""

    def test_listar_empresas_exitoso(self):
        """✓ Debe retornar lista de empresas."""
        mock_repo = Mock()
        mock_repo.list_all.return_value = [
            Empresa(nit="900000001-1", nombre="Empresa 1", direccion="Dir 1", telefono="3001111111"),
            Empresa(nit="900000002-1", nombre="Empresa 2", direccion="Dir 2", telefono="3002222222"),
        ]
        
        use_case = ListarEmpresasUseCase(mock_repo)
        resultado = use_case.execute()
        
        assert len(resultado) == 2
        assert resultado[0].nombre == "Empresa 1"
        assert resultado[1].nombre == "Empresa 2"

    def test_listar_empresas_vacio(self):
        """✓ Debe retornar lista vacía si no hay empresas."""
        mock_repo = Mock()
        mock_repo.list_all.return_value = []
        
        use_case = ListarEmpresasUseCase(mock_repo)
        resultado = use_case.execute()
        
        assert resultado == []
        assert len(resultado) == 0

    def test_listar_empresas_error_infraestructura(self):
        """✓ Debe manejar errores de infraestructura."""
        mock_repo = Mock()
        mock_repo.list_all.side_effect = Exception("Connection timeout")
        
        use_case = ListarEmpresasUseCase(mock_repo)
        
        with pytest.raises(InfrastructureError, match="Error consultando"):
            use_case.execute()


class TestCrearProductoUseCase:
    """Pruebas para el caso de uso CrearProducto."""

    def test_crear_producto_exitoso(self):
        """✓ Debe crear producto correctamente."""
        mock_repo = Mock()
        producto_esperado = Producto(
            codigo="PROD-001",
            nombre="Producto Test",
            caracteristicas="Descripción",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("100")}
        )
        mock_repo.save.return_value = producto_esperado
        
        use_case = CrearProductoUseCase(mock_repo)
        resultado = use_case.execute(
            codigo="PROD-001",
            nombre="Producto Test",
            caracteristicas="Descripción",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("100")}
        )
        
        assert resultado.codigo == "PROD-001"
        assert resultado.nombre == "Producto Test"
        mock_repo.save.assert_called_once()

    def test_crear_producto_sin_codigo(self):
        """✓ Debe fallar si falta el código."""
        mock_repo = Mock()
        use_case = CrearProductoUseCase(mock_repo)
        
        with pytest.raises(ValueError, match="código del producto es obligatorio"):
            use_case.execute(
                codigo="",
                nombre="Test",
                caracteristicas="Desc",
                empresa_nit="900123456-1",
                precios={"USD": Decimal("100")}
            )

    def test_crear_producto_sin_precios(self):
        """✓ Debe fallar si no tiene precios."""
        mock_repo = Mock()
        use_case = CrearProductoUseCase(mock_repo)
        
        with pytest.raises(ValueError, match="debe tener al menos un precio"):
            use_case.execute(
                codigo="PROD-001",
                nombre="Test",
                caracteristicas="Desc",
                empresa_nit="900123456-1",
                precios={}
            )


class TestListarProductosPorEmpresaUseCase:
    """Pruebas para el caso de uso ListarProductosPorEmpresa."""

    def test_listar_productos_exitoso(self):
        """✓ Debe retornar productos de una empresa."""
        mock_repo = Mock()
        mock_repo.list_by_empresa.return_value = [
            Producto(
                codigo="PROD-001",
                nombre="Producto 1",
                caracteristicas="Desc 1",
                empresa_nit="900123456-1",
                precios={"USD": Decimal("100")}
            ),
            Producto(
                codigo="PROD-002",
                nombre="Producto 2",
                caracteristicas="Desc 2",
                empresa_nit="900123456-1",
                precios={"USD": Decimal("200")}
            ),
        ]
        
        use_case = ListarProductosPorEmpresaUseCase(mock_repo)
        resultado = use_case.execute("900123456-1")
        
        assert len(resultado) == 2
        assert resultado[0].codigo == "PROD-001"
        assert resultado[1].codigo == "PROD-002"

    def test_listar_productos_empresa_sin_productos(self):
        """✓ Debe retornar lista vacía si la empresa no tiene productos."""
        mock_repo = Mock()
        mock_repo.list_by_empresa.return_value = []
        
        use_case = ListarProductosPorEmpresaUseCase(mock_repo)
        resultado = use_case.execute("900999999-1")
        
        assert resultado == []


# ============================================================================
# 3. TESTS DE SERIALIZERS (Django REST Framework)
# ============================================================================

class TestEmpresaSerializer:
    """Pruebas para el serializador de Empresa."""

    def test_serializer_campos_requeridos(self):
        """✓ Debe validar campos requeridos."""
        serializer = EmpresaSerializer(data={})
        assert not serializer.is_valid()
        assert 'nit' in serializer.errors
        assert 'nombre' in serializer.errors

    @pytest.mark.django_db
    def test_serializer_datos_validos(self):
        """✓ Debe aceptar datos válidos."""
        data = {
            'nit': '900123456-1',
            'nombre': 'Empresa Test',
            'direccion': 'Calle 100',
            'telefono': '3001234567'
        }
        serializer = EmpresaSerializer(data=data)
        assert serializer.is_valid()

    def test_serializer_serializacion(self):
        """✓ Debe serializar correctamente una empresa."""
        mock_empresa = MagicMock()
        mock_empresa.nit = '900123456-1'
        mock_empresa.nombre = 'Test'
        mock_empresa.direccion = 'Dir'
        mock_empresa.telefono = '3001234567'
        
        serializer = EmpresaSerializer(mock_empresa)
        data = serializer.data
        
        assert data['nit'] == '900123456-1'
        assert data['nombre'] == 'Test'


class TestProductoSerializer:
    """Pruebas para el serializador de Producto."""

    def test_serializer_codigo_valido(self):
        """✓ Debe aceptar códigos alfanuméricos válidos."""
        serializer = ProductoSerializer()
        
        # Códigos válidos
        assert serializer.validate_codigo("PROD-001") == "PROD-001"
        assert serializer.validate_codigo("ABC_123") == "ABC_123"
        assert serializer.validate_codigo("item123") == "item123"

    def test_serializer_codigo_invalido(self):
        """✓ Debe rechazar códigos con caracteres especiales."""
        serializer = ProductoSerializer()
        
        with pytest.raises(DRFValidationError, match="Sintaxis incorrecta"):
            serializer.validate_codigo("PROD@001")
        
        with pytest.raises(DRFValidationError, match="Sintaxis incorrecta"):
            serializer.validate_codigo("PROD 001")

    def test_serializer_precios_validos(self):
        """✓ Debe aceptar precios en formato JSON válido."""
        serializer = ProductoSerializer()
        
        precios = {"USD": 100, "COP": 400000}
        resultado = serializer.validate_precios(precios)
        
        assert resultado == precios

    def test_serializer_precios_vacios(self):
        """✓ Debe rechazar precios vacíos."""
        serializer = ProductoSerializer()
        
        with pytest.raises(DRFValidationError, match="al menos un precio"):
            serializer.validate_precios({})

    def test_serializer_precios_formato_incorrecto(self):
        """✓ Debe rechazar precios que no sean diccionario."""
        serializer = ProductoSerializer()
        
        with pytest.raises(DRFValidationError, match="Estructura de datos incorrecta"):
            serializer.validate_precios([100, 200])
        
        with pytest.raises(DRFValidationError, match="Estructura de datos incorrecta"):
            serializer.validate_precios("100")


# ============================================================================
# 4. TESTS DE EXCEPCIONES DEL DOMINIO
# ============================================================================

class TestDomainExceptions:
    """Pruebas para las excepciones personalizadas del dominio."""

    def test_entity_validation_error(self):
        """✓ EntityValidationError debe heredar de DomainError."""
        error = EntityValidationError("Campo inválido")
        assert str(error) == "Campo inválido"
        assert isinstance(error, Exception)

    def test_business_rule_error(self):
        """✓ BusinessRuleError debe contener mensaje descriptivo."""
        error = BusinessRuleError("Ya existe el recurso")
        assert "Ya existe" in str(error)

    def test_infrastructure_error(self):
        """✓ InfrastructureError para errores de BD."""
        error = InfrastructureError("Connection failed")
        assert "Connection failed" in str(error)

    def test_excepciones_son_capturables(self):
        """✓ Las excepciones deben ser capturables específicamente."""
        def funcion_que_falla():
            raise BusinessRuleError("Error de negocio")
        
        with pytest.raises(BusinessRuleError):
            funcion_que_falla()


# ============================================================================
# 5. TESTS DE INTEGRACIÓN CON DJANGO (usando TestCase)
# ============================================================================

class TestEmpresaModelDjango(TestCase):
    """Pruebas de integración para el modelo EmpresaModel."""

    def test_crear_empresa_model_valido(self):
        """✓ Debe crear modelo de empresa válido."""
        empresa = EmpresaModel.objects.create(
            nit="900111222-3",
            nombre="Django Test Corp",
            direccion="Av. Principal 123",
            telefono="3009876543"
        )
        
        self.assertEqual(empresa.nit, "900111222-3")
        self.assertEqual(empresa.nombre, "Django Test Corp")
        self.assertEqual(str(empresa), "Django Test Corp (900111222-3)")

    def test_empresa_model_validacion_entidad(self):
        """✓ El modelo debe validar usando la entidad del dominio."""
        empresa = EmpresaModel(
            nit="INVALIDO-ABC",
            nombre="Test",
            direccion="Dir",
            telefono="3001234567"
        )
        
        with self.assertRaises(ValidationError):
            empresa.save()

    def test_empresa_model_telefono_corto(self):
        """✓ Debe fallar con teléfono muy corto."""
        empresa = EmpresaModel(
            nit="900111222-3",
            nombre="Test",
            direccion="Dir",
            telefono="123"
        )
        
        with self.assertRaises(ValidationError):
            empresa.save()


class TestProductoModelDjango(TestCase):
    """Pruebas de integración para el modelo ProductoModel."""

    def setUp(self):
        """Crear empresa de prueba para los productos."""
        self.empresa = EmpresaModel.objects.create(
            nit="900999888-1",
            nombre="Empresa Productos Test",
            direccion="Calle Test",
            telefono="3001112233"
        )

    def test_crear_producto_model_valido(self):
        """✓ Debe crear modelo de producto válido."""
        producto = ProductoModel.objects.create(
            codigo="TEST-001",
            nombre="Producto Django Test",
            caracteristicas="Producto para pruebas unitarias",
            empresa=self.empresa,
            precios={"USD": 50, "COP": 200000}
        )
        
        self.assertEqual(producto.codigo, "TEST-001")
        self.assertEqual(producto.empresa.nit, "900999888-1")
        self.assertEqual(str(producto), "Producto Django Test")

    def test_producto_model_codigo_unico(self):
        """✓ El código del producto debe ser único."""
        ProductoModel.objects.create(
            codigo="UNIQUE-001",
            nombre="Primero",
            caracteristicas="Test",
            empresa=self.empresa,
            precios={"USD": 100}
        )
        
        with self.assertRaises(Exception):
            ProductoModel.objects.create(
                codigo="UNIQUE-001",
                nombre="Duplicado",
                caracteristicas="Test",
                empresa=self.empresa,
                precios={"USD": 200}
            )

    def test_producto_model_sin_precios(self):
        """✓ Debe fallar si no tiene precios."""
        producto = ProductoModel(
            codigo="NO-PRICE",
            nombre="Sin Precio",
            caracteristicas="Test",
            empresa=self.empresa,
            precios={}
        )
        
        with self.assertRaises(ValidationError):
            producto.save()

    def test_producto_cascade_delete(self):
        """✓ Productos deben eliminarse al eliminar empresa."""
        ProductoModel.objects.create(
            codigo="CASCADE-001",
            nombre="Producto Cascade",
            caracteristicas="Test cascade delete",
            empresa=self.empresa,
            precios={"USD": 100}
        )
        
        self.assertEqual(ProductoModel.objects.filter(empresa=self.empresa).count(), 1)
        
        self.empresa.delete()
        
        self.assertEqual(ProductoModel.objects.filter(codigo="CASCADE-001").count(), 0)


# ============================================================================
# 6. TESTS DE MODELO DE USUARIO
# ============================================================================

class TestUserModel(TestCase):
    """Pruebas para el modelo de Usuario personalizado."""

    def test_crear_usuario_normal(self):
        """✓ Debe crear usuario con email y password."""
        from users.models import User
        
        user = User.objects.create_user(
            email="test@example.com",
            password="securepassword123"
        )
        
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("securepassword123"))
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertTrue(user.is_active)

    def test_crear_superusuario(self):
        """✓ Debe crear superusuario con permisos completos."""
        from users.models import User
        
        admin = User.objects.create_superuser(
            email="admin@example.com",
            password="adminpass123"
        )
        
        self.assertEqual(admin.email, "admin@example.com")
        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)

    def test_usuario_sin_email(self):
        """✓ Debe fallar al crear usuario sin email."""
        from users.models import User
        
        with self.assertRaises(ValueError):
            User.objects.create_user(email="", password="test123")

    def test_usuario_str_representation(self):
        """✓ La representación string debe ser el email."""
        from users.models import User
        
        user = User.objects.create_user(
            email="string@test.com",
            password="test123"
        )
        
        self.assertEqual(str(user), "string@test.com")

    def test_email_normalizado(self):
        """✓ El email debe normalizarse (dominio en minúsculas)."""
        from users.models import User
        
        user = User.objects.create_user(
            email="Test@EXAMPLE.COM",
            password="test123"
        )
        
        self.assertEqual(user.email, "Test@example.com")


# ============================================================================
# 7. TESTS DE MOCK REPOSITORIES (Prueba de arquitectura)
# ============================================================================

class TestMockRepositories:
    """Pruebas que demuestran el desacoplamiento de la arquitectura."""

    def test_repositorio_empresa_mock_completo(self):
        """✓ El sistema funciona con un repositorio completamente mockeado."""
        
        class FakeEmpresaRepo:
            def __init__(self):
                self.storage = {}
            
            def save(self, empresa):
                self.storage[empresa.nit] = empresa
                return empresa
            
            def get_by_nit(self, nit):
                return self.storage.get(nit)
            
            def list_all(self):
                return list(self.storage.values())
            
            def delete(self, nit):
                if nit in self.storage:
                    del self.storage[nit]
        
        repo = FakeEmpresaRepo()
        use_case = CrearEmpresaUseCase(repo)
        
        # Crear empresa
        empresa = use_case.execute(
            nit="999888777-1",
            nombre="Empresa Fake",
            direccion="Memoria RAM",
            telefono="3001234567"
        )
        
        assert empresa.nombre == "Empresa Fake"
        assert repo.get_by_nit("999888777-1") is not None
        assert len(repo.list_all()) == 1

    def test_repositorio_producto_mock_completo(self):
        """✓ El sistema de productos funciona con repositorio mockeado."""
        
        class FakeProductoRepo:
            def __init__(self):
                self.storage = []
            
            def save(self, producto):
                self.storage.append(producto)
                return producto
            
            def list_by_empresa(self, nit):
                return [p for p in self.storage if p.empresa_nit == nit]
        
        repo = FakeProductoRepo()
        use_case = CrearProductoUseCase(repo)
        
        # Crear producto
        producto = use_case.execute(
            codigo="FAKE-001",
            nombre="Producto en RAM",
            caracteristicas="Sin base de datos",
            empresa_nit="999888777-1",
            precios={"USD": Decimal("99.99")}
        )
        
        assert producto.codigo == "FAKE-001"
        assert len(repo.list_by_empresa("999888777-1")) == 1


# ============================================================================
# 8. TESTS DE EDGE CASES Y BOUNDARIES
# ============================================================================

class TestEdgeCases:
    """Pruebas de casos límite y condiciones de borde."""

    def test_empresa_nit_limite_caracteres(self):
        """✓ Debe aceptar NITs de diferentes longitudes válidas."""
        # NIT corto válido
        empresa1 = Empresa(nit="1-1", nombre="Test", direccion="Dir", telefono="3001234567")
        assert empresa1.nit == "1-1"
        
        # NIT largo válido
        empresa2 = Empresa(nit="9001234567890-1", nombre="Test", direccion="Dir", telefono="3001234567")
        assert empresa2.nit == "9001234567890-1"

    def test_producto_precio_decimal_precision(self):
        """✓ Debe manejar precios con alta precisión decimal."""
        producto = Producto(
            codigo="DECIMAL-001",
            nombre="Test",
            caracteristicas="Test",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("999.99999")}
        )
        
        assert producto.obtener_precio("USD") == Decimal("999.99999")

    def test_producto_precio_cero(self):
        """✓ Debe aceptar precio cero (productos gratuitos)."""
        producto = Producto(
            codigo="FREE-001",
            nombre="Producto Gratis",
            caracteristicas="Test",
            empresa_nit="900123456-1",
            precios={"USD": Decimal("0")}
        )
        
        assert producto.obtener_precio("USD") == Decimal("0")

    def test_empresa_caracteres_especiales_nombre(self):
        """✓ Debe aceptar caracteres especiales en nombre de empresa."""
        empresa = Empresa(
            nit="900123456-1",
            nombre="Café & Más S.A.S - Cía. Ltda.",
            direccion="Calle 100 #15-20",
            telefono="3001234567"
        )
        
        assert "Café" in empresa.nombre
        assert "&" in empresa.nombre

    def test_producto_caracteristicas_multilinea(self):
        """✓ Debe aceptar características con múltiples líneas."""
        caracteristicas = """
        - Procesador: Intel Core i7
        - RAM: 16GB DDR4
        - Almacenamiento: 512GB SSD
        - Pantalla: 15.6" Full HD
        """
        
        producto = Producto(
            codigo="LAPTOP-001",
            nombre="Laptop Premium",
            caracteristicas=caracteristicas,
            empresa_nit="900123456-1",
            precios={"USD": Decimal("1299")}
        )
        
        assert "Procesador" in producto.caracteristicas
        assert "16GB" in producto.caracteristicas


# ============================================================================
# CONFIGURACIÓN DE PYTEST
# ============================================================================

if __name__ == "__main__":
    pytest.main([__file__, "-v", "--tb=short"])
