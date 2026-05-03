from rest_framework import serializers
from .models import Compra, DetalleCompra, ComprobanteCompra
from .services import CompraService


class DetalleCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleCompra
        fields = ['producto', 'cantidad', 'precio_unitario']


class ComprobanteCompraSerializer(serializers.ModelSerializer):
    class Meta:
        model = ComprobanteCompra
        fields = ['numero_comprobante', 'fecha_emision']


class CompraSerializer(serializers.ModelSerializer):
    detalles = DetalleCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ['id_compra', 'total_compra', 'responsable_abastecimiento', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')

        return CompraService.crear_compra(
            data=validated_data,
            detalles_data=detalles_data
        )