from rest_framework import serializers
from .models import Venta, Comprobante, DetalleVenta
from usuarios.models import Usuario
from .services import VentaService


class VentaDetalleListSerializer(serializers.ModelSerializer):
    nombre = serializers.CharField(source='producto.nombre_producto', read_only=True)
    total = serializers.SerializerMethodField()

    class Meta:
        model = DetalleVenta
        fields = ['id_detalle', 'nombre', 'cantidad', 'precio_unitario_venta', 'total']

    def get_total(self, obj):
        return obj.cantidad * obj.precio_unitario_venta


class ComprobanteSerializer(serializers.ModelSerializer):
    class Meta:
        model = Comprobante
        fields = ['numero_comprobante', 'fecha_emision']


class DetalleVentaSerializer(serializers.ModelSerializer):
    class Meta:
        model = DetalleVenta
        fields = ['producto', 'cantidad']


class VentaSerializer(serializers.ModelSerializer):
    items = DetalleVentaSerializer(many=True)
    comprobante = ComprobanteSerializer(read_only=True)

    vendedor = serializers.PrimaryKeyRelatedField(
        queryset=Usuario.objects.all()
    )

    class Meta:
        model = Venta
        fields = ['id_venta', 'vendedor', 'fecha_venta', 'comprobante', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')

        return VentaService.crear_venta(
            data=validated_data,
            items_data=items_data
        )