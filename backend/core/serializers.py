from rest_framework import serializers
from .models import EmpresaModel, ProductoModel
import re

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaModel
        fields = '__all__'

    def validate_nit(self, value):
        if not re.match(r'^[0-9-]+$', value):
            raise serializers.ValidationError("El NIT solo puede contener números y guiones (-).")
        return value

    def validate_telefono(self, value):
        if len(value) < 7:
            raise serializers.ValidationError("El teléfono es muy corto (mínimo 7 dígitos).")
        
        if not re.match(r'^\+?[0-9]+$', value):
             raise serializers.ValidationError("El teléfono debe contener solo números.")
        return value

class ProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ProductoModel
        fields = '__all__'
        
    def validate_codigo(self, value):
        if not re.match(r'^[A-Za-z0-9-_]+$', value):
            raise serializers.ValidationError("El código solo acepta letras, números, guiones (-) y piso (_).")
        return value

    def validate_precios(self, value):

        if not isinstance(value, dict):
            raise serializers.ValidationError("El formato de precios es inválido. Debe ser un objeto JSON.")
        
        if not value:
            raise serializers.ValidationError("Debes agregar al menos un precio.")

        for moneda, monto in value.items():
            if not re.match(r'^[A-Z]{3}$', moneda):
                raise serializers.ValidationError(f"La moneda '{moneda}' no es válida. Usa códigos ISO (ej: USD, COP).")
            
            try:
                monto_float = float(monto)
                if monto_float < 0:
                    raise serializers.ValidationError(f"El precio en {moneda} no puede ser negativo.")
            except (ValueError, TypeError):
                raise serializers.ValidationError(f"El valor para {moneda} debe ser un número válido.")

        return value

class SystemStatusSerializer(serializers.Serializer):
    api = serializers.CharField()
    version = serializers.CharField()
    status = serializers.CharField()
    database = serializers.CharField()
    error = serializers.CharField(required=False)