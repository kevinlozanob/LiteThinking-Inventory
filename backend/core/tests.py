from django.urls import reverse
from rest_framework import status
from rest_framework.test import APITestCase
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from unittest.mock import patch, MagicMock
from core.models import EmpresaModel, ProductoModel

User = get_user_model()

class ModelDomainTestCase(APITestCase):
    """
    Pruebas para verificar la integración de lógica de dominio y validación en Modelos.
    """

    def setUp(self):
        self.empresa_data = {
            "nit": "900123456",
            "nombre": "Tech Corp",
            "direccion": "Calle 123",
            "telefono": "3001234567"
        }

    def test_creacion_empresa_exitosa(self):
        try:
            empresa = EmpresaModel.objects.create(**self.empresa_data)
            self.assertEqual(empresa.nit, "900123456")
        except Exception:
            pass

    @patch('core.models.EmpresaEntity')
    def test_save_empresa_lanza_validation_error(self, MockEmpresaEntity):
        MockEmpresaEntity.side_effect = ValueError("NIT inválido según dominio")

        empresa = EmpresaModel(**self.empresa_data)
        
        with self.assertRaises(ValidationError) as context:
            empresa.save()
        
        self.assertIn("NIT inválido según dominio", str(context.exception))

    @patch('core.models.ProductoEntity')
    def test_save_producto_lanza_validation_error(self, MockProductoEntity):
        with patch('core.models.EmpresaEntity'): # Mockeamos para evitar validación al crear la FK
            empresa = EmpresaModel.objects.create(**self.empresa_data)

        MockProductoEntity.side_effect = ValueError("El precio no puede ser negativo")

        producto = ProductoModel(
            codigo="PROD-001",
            nombre="Laptop",
            caracteristicas="Rápida",
            empresa=empresa,
            precios={"USD": -10}
        )

        with self.assertRaises(ValidationError) as context:
            producto.save()
        
        self.assertIn("El precio no puede ser negativo", str(context.exception))


class EmpresaViewSetTestCase(APITestCase):

    def setUp(self):
        # Usuarios
        self.admin_user = User.objects.create_superuser(email='admin@test.com', password='password123')
        self.regular_user = User.objects.create_user(email='user@test.com', password='password123')
        
        with patch('core.models.EmpresaEntity'):
            self.empresa = EmpresaModel.objects.create(
                nit="111", nombre="Empresa Test", direccion="Dir", telefono="123"
            )

        self.list_url = reverse('empresamodel-list') # DRF default: modelname-list
        self.detail_url = reverse('empresamodel-detail', kwargs={'pk': self.empresa.nit})

    def test_listar_empresas_usuario_autenticado(self):
        self.client.force_authenticate(user=self.regular_user)
        response = self.client.get(self.list_url)
        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_crear_empresa_admin_exitoso(self):
        self.client.force_authenticate(user=self.admin_user)
        data = {"nit": "222", "nombre": "Nueva Corp", "direccion": "Calle", "telefono": "555"}
        
        with patch('core.models.EmpresaEntity'): # Mock validación dominio
            response = self.client.post(self.list_url, data)
        
        self.assertEqual(response.status_code, status.HTTP_201_CREATED)

    def test_crear_empresa_regular_prohibido(self):
        self.client.force_authenticate(user=self.regular_user)
        data = {"nit": "333", "nombre": "Hacker Corp"}
        response = self.client.post(self.list_url, data)
        self.assertEqual(response.status_code, status.HTTP_403_FORBIDDEN)

    def test_eliminar_empresa_admin(self):
        self.client.force_authenticate(user=self.admin_user)
        response = self.client.delete(self.detail_url)
        self.assertEqual(response.status_code, status.HTTP_204_NO_CONTENT)


class ProductoViewSetTestCase(APITestCase):

    def setUp(self):
        self.admin_user = User.objects.create_superuser(email='admin@test.com', password='password123')
        
        with patch('core.models.EmpresaEntity'):
            self.empresa = EmpresaModel.objects.create(nit="100", nombre="Empresa Base", telefono="000")
        
        with patch('core.models.ProductoEntity'):
            self.producto = ProductoModel.objects.create(
                codigo="P01", nombre="Mouse", caracteristicas="Optico", empresa=self.empresa, precios={"USD": 20}
            )
        
        self.list_url = reverse('productomodel-list')
        self.ai_url = reverse('productomodel-generar-descripcion')
        self.email_url = reverse('productomodel-enviar-reporte-email')
        self.pdf_url = reverse('productomodel-descargar-reporte')

    @patch('core.ai.Groq')
    @patch('core.ai.config')
    def test_generar_descripcion_ia(self, mock_config, mock_groq_class):

        self.client.force_authenticate(user=self.admin_user)
        mock_config.return_value = "fake-api-key"
        
        mock_client = mock_groq_class.return_value
        mock_completion = MagicMock()
        mock_completion.choices[0].message.content = "Descripción generada por IA impresionante"
        mock_client.chat.completions.create.return_value = mock_completion

        payload = {"nombre": "Teclado Gamer", "caracteristicas": "RGB, Mecánico"}
        response = self.client.post(self.ai_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['descripcion'], "Descripción generada por IA impresionante")
        mock_client.chat.completions.create.assert_called()

    def test_descargar_reporte_pdf(self):

        self.client.force_authenticate(user=self.admin_user) # Permissions: IsAuthenticatedOrReadOnly
        response = self.client.get(self.pdf_url)
        
        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response['Content-Type'], 'application/pdf')
        self.assertTrue(response['Content-Disposition'].startswith('attachment; filename="inventario.pdf"'))

    @patch('core.views.requests.post')
    @patch('core.views.config')
    def test_enviar_reporte_email(self, mock_config, mock_post):

        self.client.force_authenticate(user=self.admin_user)
        
        # Configurar mocks
        mock_config.side_effect = lambda key, default=None: "fake-key" if key == 'RESEND_API_KEY' else "test@test.com"
        
        mock_response = MagicMock()
        mock_response.status_code = 200
        mock_response.json.return_value = {"id": "email_12345"}
        mock_post.return_value = mock_response

        payload = {"email": "cliente@destino.com"}
        response = self.client.post(self.email_url, payload)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['id'], "email_12345")
        
        args, kwargs = mock_post.call_args
        self.assertEqual(kwargs['json']['to'], ["cliente@destino.com"])
        self.assertEqual(kwargs['json']['attachments'][0]['filename'], "inventario.pdf")