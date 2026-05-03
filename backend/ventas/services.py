from django.db import transaction
from django.core.exceptions import ValidationError
import uuid

from .models import Venta, DetalleVenta, Comprobante
from inventario.models import Sector, StockMovimiento


class VentaService:

    @staticmethod
    @transaction.atomic
    def crear_venta(data, items_data):

        vendedor = data.get('vendedor')

        if vendedor is None:
            raise ValidationError("Debe especificarse un vendedor")

        # 1. Crear comprobante
        comprobante = Comprobante.objects.create(
            numero_comprobante=f"TKT-{uuid.uuid4().hex[:6].upper()}"
        )

        # 2. Crear venta
        venta = Venta.objects.create(
            vendedor=vendedor,
            comprobante=comprobante
        )

        # 3. Obtener sector salón
        salon = Sector.objects.get(tipo='SALON')

        # 4. Procesar items
        for item in items_data:
            producto = item['producto']
            cantidad = item['cantidad']

            # A. Crear detalle
            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario_venta=producto.precio_unitario
            )

            # B. Generar movimiento de stock
            StockMovimiento.objects.create(
                producto=producto,
                tipo="salida",
                sector_origen=salon,
                cantidad=cantidad
            )

        return venta