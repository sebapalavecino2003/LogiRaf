from django.db import transaction
from rest_framework import serializers
import uuid
from .models import Compra, DetalleCompra, ComprobanteCompra
from inventario.models import Producto, Categoria, Sector, StockPorSector, StockMovimiento

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
        # 1. Extraemos los detalles
        detalles_data = validated_data.pop('detalles')
        
        # Usamos una transacción para que se guarde TODO o NADA
        with transaction.atomic():
            # 2. Creamos la cabecera de la compra
            compra = Compra.objects.create(**validated_data)
            
            # 3. Generamos el Comprobante automáticamente
            ticket_nro = f"CMP-{uuid.uuid4().hex[:6].upper()}"
            ComprobanteCompra.objects.create(
                compra=compra, 
                numero_comprobante=ticket_nro
            )
            
            # 4. Procesamos cada producto
            for detalle in detalles_data:
                # El serializer ya nos da el objeto Producto gracias a la FK
                producto: Producto = detalle['producto']
                cantidad = detalle['cantidad']
                
                # A. Creamos el registro del detalle
                DetalleCompra.objects.create(compra=compra, **detalle)
                
                # B. Sumamos al stock general del Producto
                producto.stock_actual += cantidad
                producto.save()

                # C. Sumamos específicamente al DEPOSITO en la tabla Stock
                # get_or_create por si es la primera vez que entra ese producto
                stock_obj, _ = Stock.objects.get_or_create(
                    producto=producto,
                    ubicacion='DEPOSITO',
                    defaults={'cantidad': 0}
                )
                stock_obj.cantidad += cantidad
                stock_obj.save()
                
        return compra