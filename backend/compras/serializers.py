# backend/compras/serializers.py
from rest_framework import serializers
from .models import Compra, DetalleCompra, ComprobanteCompra
from .services import CompraService
from inventario.models import Producto

class DetalleCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleCompra
        fields = ['producto', 'cantidad', 'precio_unitario']

class ComprobanteCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComprobanteCompra
        fields = ['numero_comprobante', 'fecha_emision']

class CompraSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraSerializer(many=True, write_only=True)
    comprobante_detalle = ComprobanteCompraSerializer(read_only=True)
    
    class Meta:
        model = Compra
        fields = ['id_compra', 'total_compra', 'responsable_abastecimiento', 
                  'detalles', 'comprobante_detalle', 'fecha_compra']
        read_only_fields = ['id_compra', 'total_compra', 'fecha_compra', 'comprobante_detalle']

    def create(self, validated_data):
        """Solo prepara datos, la lógica está en CompraService"""
        detalles = validated_data.pop('detalles')
        
        compra = CompraService.crear_compra(
            responsable=validated_data['responsable_abastecimiento'],
            items_data=detalles
        )
        
        return compra