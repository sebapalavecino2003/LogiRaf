from rest_framework import serializers
from .models import Compra, DetalleCompra, ComprobanteCompra
from .services import CompraService


class DetalleCompraSerializer(serializers.ModelSerializer):
    """Serializador para la estructura de cada línea de detalle de compra."""

    class Meta:
        model = DetalleCompra
        fields = ['producto', 'cantidad', 'precio_unitario']


class ComprobanteCompraSerializer(serializers.ModelSerializer):
    """Serializador para mostrar los datos del comprobante de compra."""

    class Meta:
        model = ComprobanteCompra
        fields = ['numero_comprobante', 'fecha_emision']


class CompraSerializer(serializers.ModelSerializer):
    """Serializador principal de compras que incluye detalles y validación."""

    detalles = DetalleCompraSerializer(many=True)

    class Meta:
        model = Compra
        fields = ['id_compra', 'total_compra', 'responsable_abastecimiento', 'detalles']

    def create(self, validated_data):
        detalles_data = validated_data.pop('detalles')

        # Delega la creación completa de la compra al servicio de compras.
        return CompraService.crear_compra(
            data=validated_data,
            detalles_data=detalles_data
        )