from django.db import transaction
import uuid

from .models import Compra, DetalleCompra, ComprobanteCompra
from inventario.models import Sector, StockMovimiento


class CompraService:

    @staticmethod
    @transaction.atomic
    def crear_compra(data, detalles_data):
        """
        Orquesta toda la lógica de compra
        """

        # 1. Crear compra
        compra = Compra.objects.create(**data)

        # 2. Crear comprobante
        comprobante = ComprobanteCompra.objects.create(
            compra=compra,
            numero_comprobante=f"CMP-{uuid.uuid4().hex[:6].upper()}"
        )

        # 3. Obtener sector depósito
        deposito = Sector.objects.get(tipo='DEPOSITO')

        # 4. Procesar detalles
        for detalle in detalles_data:
            producto = detalle['producto']
            cantidad = detalle['cantidad']

            # A. Crear detalle
            DetalleCompra.objects.create(
                compra=compra,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=detalle['precio_unitario']
            )

            # B. Generar movimiento de stock (🔥 clave)
            StockMovimiento.objects.create(
                producto=producto,
                tipo="entrada",
                sector_destino=deposito,
                cantidad=cantidad
            )

        return compra