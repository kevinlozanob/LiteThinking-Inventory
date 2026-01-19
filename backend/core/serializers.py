from rest_framework import serializers
import re

# --- SERIALIZERS (CLEAN ARCHITECTURE) ---

class EmpresaSerializer(serializers.Serializer):
    # Definimos campos explícitamente
    nit = serializers.CharField(max_length=50)
    nombre = serializers.CharField(max_length=255)
    direccion = serializers.CharField(max_length=255)
    telefono = serializers.CharField(max_length=20)

    def validate_nit(self, value):
        if not value:
            raise serializers.ValidationError("El campo NIT es obligatorio.")
        return value

class ProductoSerializer(serializers.Serializer):
    id = serializers.IntegerField(read_only=True, required=False)
    codigo = serializers.CharField(max_length=50)
    nombre = serializers.CharField(max_length=255)
    caracteristicas = serializers.CharField() 
    # Mapeamos 'empresa_nit' del dominio al campo 'empresa' del JSON
    empresa = serializers.CharField(source='empresa_nit') 
    precios = serializers.JSONField()

    def validate_codigo(self, value):
        if not re.match(r'^[A-Za-z0-9-_]+$', value):
            raise serializers.ValidationError("Sintaxis incorrecta. El código solo permite letras alfanuméricas, guiones (-) y guiones bajos (_).")
        return value

    def validate_precios(self, value):
        if not isinstance(value, dict) or not value:
            raise serializers.ValidationError("Estructura de datos incorrecta. Se espera JSON.")
        return value

class SystemStatusSerializer(serializers.Serializer):
    api = serializers.CharField()
    version = serializers.CharField()
    status = serializers.CharField()
    database = serializers.CharField()