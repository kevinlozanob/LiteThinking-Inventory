#!/bin/sh

echo "Esperando a PostgreSQL..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL iniciado."

if [ -z "$GROQ_API_KEY" ]; then
  echo ""
  echo "╔═══════════════════════════════════════════════════════════════════════════╗"
  echo "║    ATENCIÓN: NO SE DETECTÓ EL ARCHIVO .env COMPLETO                       ║"
  echo "╠═══════════════════════════════════════════════════════════════════════════╣"
  echo "║  No se detectaron las llaves de Inteligencia Artificial (Groq)            ║"
  echo "║  ni el servicio de Correos (Resend).                                      ║"
  echo "║                                                                           ║"
  echo "║  PARA HABILITAR TODAS LA FUNCIONALIDADES:                                 ║"
  echo "║  1. Cree un archivo llamado '.env' en la raíz del proyecto.               ║"
  echo "║  2. Pegue el contenido de las variables enviadas en el CORREO DE ENTREGA. ║"
  echo "║  3. Reinicie con: docker compose up --build                               ║"
  echo "║                                                                           ║"
  echo "║  (El sistema continuará iniciando, pero sin funciones todas sus funciones)║"
  echo "╚═══════════════════════════════════════════════════════════════════════════╝"
  echo ""
  sleep 3 
else
  echo ""
  echo "Variables de entorno detectadas correctamente. Iniciando con todos los servicios"
  echo ""
fi
# ---------------------------------------

echo "Aplicando migraciones..."
python manage.py migrate

echo "Recolectando archivos estáticos..."
python manage.py collectstatic --noinput

echo "Verificando estado de la base de datos..."

python manage.py shell -c "from django.contrib.auth import get_user_model; User = get_user_model(); exit(1) if not User.objects.filter(email='nicklcsdev@gmail.com').exists() else exit(0)"

if [ $? -eq 1 ]; then
    echo "Base de datos nueva detectada. Ejecutando SEED automático..."
    python manage.py seed_db
    echo "Datos de prueba cargados exitosamente."
else
    echo "La base de datos ya tiene información. Saltando Seed."
fi
# --------------------------------

echo "Iniciando servidor..."
python manage.py runserver 0.0.0.0:8000