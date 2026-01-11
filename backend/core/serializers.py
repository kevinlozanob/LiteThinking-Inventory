from rest_framework import serializers
from .models import EmpresaModel, ProductoModel

class EmpresaSerializer(serializers.ModelSerializer):
    class Meta:
        model = EmpresaModel
        fields = '__all__'

class ProductoSerializer(serializers.ModelSerializer):
    
    class Meta:
        model = ProductoModel
        fields = '__all__'
        
    def validate_precios(self, value):

        if not isinstance(value, dict):
            raise serializers.ValidationError("El campo precios debe ser un objeto JSON (diccionario).")
        return value