import random
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from core.models import EmpresaModel, ProductoModel

class Command(BaseCommand):
    help = 'Poblar la base de datos (Empresas, Productos, Usuarios)'

    def handle(self, *args, **kwargs):
        User = get_user_model()
        self.stdout.write(self.style.WARNING('--- INICIANDO SEEDING DE DATOS ---'))

        self.stdout.write("Limpiando datos antiguos...")
        ProductoModel.objects.all().delete()
        EmpresaModel.objects.all().delete()
        User.objects.filter(email__in=['nicklcsdev@gmail.com', 'visitante@test.com']).delete()

        self.stdout.write("Creando usuarios...")
        User.objects.create_superuser('nicklcsdev@gmail.com', 'nicklcsdev')
        User.objects.create_user('visitante@test.com', '123456')

        dataset = [
            {
                "nit": "900847362-4",
                "nombre": "NicklcsDev S.A.S",
                "rubro": "Tecnología",
                "productos": [
                    ("iPhone 15 Pro Max", "256GB, Titanio Natural, Chip A17 Pro", 5600000),
                    ("MacBook Air M2", "13 pulgadas, 8GB RAM, 256GB SSD, Gris Espacial", 4800000),
                    ("Samsung Galaxy S24 Ultra", "AI Phone, 512GB, Titanium Grey", 5200000),
                    ("Monitor Dell UltraSharp", "27 pulgadas, USB-C Hub, 4K UHD", 1850000),
                    ("Mouse Logitech MX Master 3S", "Ergonómico, Silencioso, Bluetooth", 450000),
                    ("Teclado Mecánico Keychron K2", "Wireless, Switch Brown, RGB", 520000),
                    ("iPad Air 5ta Gen", "64GB, Wi-Fi, Chip M1, Azul", 2900000),
                    ("Auriculares Sony WH-1000XM5", "Cancelación de ruido, 30h batería", 1400000),
                    ("Servidor HP ProLiant DL380", "Gen10, Intel Xeon Silver, 32GB RAM", 12500000),
                    ("Licencia Windows 11 Pro", "OEM, 64 bits, entrega digital", 650000)
                ]
            },
            {
                "nit": "860002518-1",
                "nombre": "Avícola Santa Reyes S.A.",
                "rubro": "Alimentos",
                "productos": [
                    ("Huevo Rojo AA", "Cartón x 30 unidades, tamaño extra", 22000),
                    ("Huevo Jumbo", "Bandeja x 12 unidades, doble yema", 14500),
                    ("Gallina Campesina", "Canal entera, refrigerada, peso variable", 28000),
                    ("Pollo Entero Gigante", "Sin vísceras, marinado, 4.5 lbs", 32000),
                    ("Pechuga de Pollo", "Sin piel ni hueso, bandeja x 1kg", 24500),
                    ("Muslos de Pollo", "Bandeja x 4 unidades, frescos", 16000),
                    ("Alas de Pollo", "Corte tipo colombina, paquete x 500g", 14000),
                    ("Nuggets de Pollo", "Precocidos, bolsa x 1kg", 21000),
                    ("Salchicha de Pollo", "Paquete x 20 unidades, tipo manguera", 18000),
                    ("Abono Orgánico Gallinaza", "Saco x 40kg, compostado", 25000)
                ]
            },
            {
                "nit": "890900161-2",
                "nombre": "Ferretería Industrial SAS",
                "rubro": "Construcción",
                "productos": [
                    ("Cemento Gris Argos", "Saco 50kg, Uso General", 32500),
                    ("Varilla Corrugada 1/2", "6 metros, Sismorresistente W60", 28000),
                    ("Ladrillo Tolete Común", "Unidad, arcilla cocida", 1200),
                    ("Taladro Percutor DeWalt", "1/2 pulgada, 700W, Industrial", 450000),
                    ("Pulidora Black&Decker", "4-1/2 pulgadas, 820W", 190000),
                    ("Juego Llaves Mixtas Stanley", "12 Piezas, Cromo Vanadio", 125000),
                    ("Pintura Vinilo Tipo 1", "Cuñete 5 Galones, Blanco", 380000),
                    ("Estuco Plástico", "Galón, Interior/Exterior", 45000),
                    ("Tubo PVC Sanitario 4p", "Pavco, tramo x 6 metros", 85000),
                    ("Casco de Seguridad", "Dielectrico, con rachet, blanco", 25000)
                ]
            }
        ]

        conteo_prod = 0
        for emp in dataset:
            empresa = EmpresaModel.objects.create(
                nit=emp['nit'],
                nombre=emp['nombre'],
                direccion=f"Calle {random.randint(10, 99)} # {random.randint(1, 99)}-20",
                telefono=f"601{random.randint(3000000, 3999999)}"
            )
            self.stdout.write(f"Empresa creada: {emp['nombre']}")
            
            for i, prod in enumerate(emp['productos']):
                precio_cop = prod[2]
                precio_usd = round(precio_cop / 4150, 2)
                precio_eur = round(precio_cop / 4400, 2)
                
                prefijo = emp['rubro'][:3].upper()
                codigo = f"{prefijo}-{emp['nit'][-4:]}-{i+1:03d}"
                
                ProductoModel.objects.create(
                    codigo=codigo,
                    nombre=prod[0],
                    caracteristicas=prod[1],
                    empresa=empresa,
                    precios={"COP": precio_cop, "USD": precio_usd, "EUR": precio_eur}
                )
                conteo_prod += 1

        self.stdout.write(self.style.SUCCESS(f'SEEDING COMPLETADO: {len(dataset)} Empresas, {conteo_prod} Productos.'))
        self.stdout.write(self.style.SUCCESS('✅ Admin: nicklcsdev@gmail.com / nicklcsdev'))
        self.stdout.write(self.style.SUCCESS(
    'User: visitante@test.com / 123456 (Nota: Se pueden crear más usuarios externos mediante el registro)'
))