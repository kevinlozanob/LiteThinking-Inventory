from rest_framework import serializers
from .models import EmpresaModel, ProductoModel
import re

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaModel
        fields = '__all__'
        error_messages = {
            'nit': {
                'unique': 'Conflicto de integridad: Este NIT ya se encuentra registrado.',
                'blank': 'El campo NIT es obligatorio.',
            }
        }
class ProductoSerializer(serializers.ModelSerializer):
    class Meta:
        model = ProductoModel
        fields = '__all__'
        extra_kwargs = {
            'codigo': {
                'error_messages': {
                    'unique': 'Duplicidad detectada: El Código de producto ingresado ya existe.',
                    'blank': 'El Código del producto es obligatorio.'
                }
            }
        }
    
    def validate_codigo(self, value):
        if not re.match(r'^[A-Za-z0-9-_]+$', value):
            raise serializers.ValidationError("Sintaxis incorrecta. El código solo permite letras alfanuméricas, guiones (-) y guiones bajos (_).")
        return value

    def validate_precios(self, value):
        if not isinstance(value, dict):
            raise serializers.ValidationError("Estructura de datos incorrecta. Se esperaba un objeto JSON.")
        if not value:
            raise serializers.ValidationError("El producto debe tener asignado al menos un precio.")
        return value
class SystemStatusSerializer(serializers.Serializer):
    api = serializers.CharField()
    version = serializers.CharField()
    status = serializers.CharField()
    database = serializers.CharField()
    error = serializers.CharField(required=False)