from rest_framework import serializers
from .models import Venta, Comprobante, DetalleVenta
from usuarios.models import Usuario
from inventario.models import Producto
import uuid

class VentaDetalleListSerializer(serializers.ModelSerializer):
    """Para mostrar los productos en el listado de una venta"""
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
    """Para recibir los datos del frontend (React)"""
    class Meta:
        model = DetalleVenta
        fields = ['producto', 'cantidad']

class VentaSerializer(serializers.ModelSerializer):
    items = DetalleVentaSerializer(many=True)
    comprobante = ComprobanteSerializer(read_only=True)
    # Permitimos que el vendedor venga del frontend o se asigne por el usuario logueado
    vendedor = serializers.PrimaryKeyRelatedField(queryset=Usuario.objects.all(), required=False)

    class Meta:
        model = Venta
        fields = ['id_venta', 'vendedor', 'fecha_venta', 'comprobante', 'items']

    def create(self, validated_data):
        items_data = validated_data.pop('items')
        vendedor = validated_data.pop('vendedor', None)

        # Si no se envía vendedor, buscamos uno con rol de caja o salón
        if vendedor is None:
            vendedor = Usuario.objects.filter(
                rol__nombre_rol__in=['ENCARGADO_CAJA', 'ENCARGADO_SALON']
            ).first()
            if vendedor is None:
                raise serializers.ValidationError('No hay un responsable de venta disponible')

        ticket_nro = f"TKT-{uuid.uuid4().hex[:6].upper()}"
        comprobante_obj = Comprobante.objects.create(numero_comprobante=ticket_nro)

        # 2. Crear la venta principal (Cabecera)
        venta = Venta.objects.create(
            vendedor=vendedor, 
            comprobante=comprobante_obj, 
            **validated_data
        )

        # 3. Procesar cada producto
        for item_data in items_data:
            producto = item_data['producto']
            cantidad = item_data['cantidad']

            # Validar stock antes de descontar
            if producto.stock_actual < cantidad:
                raise serializers.ValidationError(f'Stock insuficiente para {producto.nombre_producto}')

            # Crear detalle guardando el precio del momento
            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario_venta=producto.precio_unitario
            )

            # 4. Descontar stock en la base de datos
            producto.stock_actual -= cantidad
            producto.save()

        return venta