# backend/ventas/serializers.py (simplificado)
from rest_framework import serializers
from .models import Venta, DetalleVenta, Comprobante
from .services import VentaService

class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['producto', 'cantidad']

class VentaSerializer(serializers.ModelSerializer):
    items = DetalleVentaSerializer(many=True, write_only=True)
    
    class Meta:
        model = Venta
        fields = ['id_venta', 'vendedor', 'fecha_venta', 'items']

    def create(self, validated_data):
        """Solo prepara datos, la lógica está en VentaService"""
        items = validated_data.pop('items')
        
        venta = VentaService.crear_venta(
            vendedor=validated_data['vendedor'],
            items_data=items
        )
        
        return venta