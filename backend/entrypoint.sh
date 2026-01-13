#!/bin/sh

echo "Esperando a PostgreSQL..."

while ! nc -z db 5432; do
  sleep 0.1
done

echo "PostgreSQL iniciado."

echo "Aplicando migraciones..."
python manage.py migrate

echo "Recopilando archivos estáticos..."
python manage.py collectstatic --noinput

echo "Iniciando servidor..."
python manage.py runserver 0.0.0.0:8000