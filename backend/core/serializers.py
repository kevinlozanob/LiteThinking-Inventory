from rest_framework import serializers
from .models import EmpresaModel, ProductoModel
import re

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaModel
        fields = '__all__'
        error_messages = {
            'nit': {
                'unique': 'Conflicto de integridad: Este NIT ya se encuentra registrado en la base de datos.',
                'blank': 'El campo NIT es obligatorio.',
                'max_length': 'El NIT excede la longitud máxima permitida (50 caracteres).'
            },
            'nombre': {
                'blank': 'El nombre de la empresa es requerido.'
            }
        }

    def validate_nit(self, value):
        if not re.match(r'^[0-9-]+$', value):
            raise serializers.ValidationError("Formato inválido. El NIT solo debe contener caracteres numéricos y guiones (-).")
        return value

    def validate_telefono(self, value):
        if len(value) < 7:
            raise serializers.ValidationError("Longitud insuficiente. El teléfono debe tener al menos 7 dígitos.")
        
        if not re.match(r'^\+?[0-9]+$', value):
             raise serializers.ValidationError("Caracteres inválidos. El teléfono solo admite dígitos numéricos (y prefijo +).")
        return value

class ProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ProductoModel
        fields = '__all__'
        extra_kwargs = {
            'codigo': {
                'error_messages': {
                    'unique': 'Duplicidad detectada: El Código de producto ingresado ya existe para esta empresa.',
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
            raise serializers.ValidationError("Estructura de datos incorrecta. Se esperaba un objeto JSON para los precios.")
        
        if not value:
            raise serializers.ValidationError("Regla de negocio violada: El producto debe tener asignado al menos un precio.")

        for moneda, monto in value.items():
            if not re.match(r'^[A-Z]{3}$', moneda):
                raise serializers.ValidationError(f"Código de moneda '{moneda}' no reconocido. Utilice estándares ISO 4217 (ej: USD, COP, EUR).")
            
            try:
                monto_float = float(monto)
                if monto_float <= 0:
                    raise serializers.ValidationError(f"Valor inválido para {moneda}. El precio debe ser un valor numérico positivo mayor a cero.")
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"Tipo de dato incorrecto. El valor para {moneda} no es un número válido.")

        return value

class SystemStatusSerializer(serializers.Serializer):
    api = serializers.CharField()
    version = serializers.CharField()
    status = serializers.CharField()
    database = serializers.CharField()
    error = serializers.CharField(required=False)