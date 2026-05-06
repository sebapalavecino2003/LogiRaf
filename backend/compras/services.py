from django.db import transaction
import uuid

from .models import Compra, DetalleCompra, ComprobanteCompra
from inventario.models import Sector, StockMovimiento


class CompraService:

    @staticmethod
    @transaction.atomic
    def crear_compra(data, detalles_data):
        """Ejecuta la transacción completa de compra y actualiza el stock."""

        # 1. Crear objeto Compra con los datos básicos recibidos.
        compra = Compra.objects.create(**data)

        # 2. Generar un comprobante único para la compra.
        comprobante = ComprobanteCompra.objects.create(
            compra=compra,
            numero_comprobante=f"CMP-{uuid.uuid4().hex[:6].upper()}"
        )
        # El comprobante se enlaza con la compra y se guarda su número.

        # 3. Tomar el sector de destino para las entradas de inventario.
        deposito = Sector.objects.get(tipo='DEPOSITO')
        # El stock de una compra siempre entra al depósito principal.

        # 4. Guardar cada detalle de la compra y mover stock.
        for detalle in detalles_data:
            producto = detalle['producto']
            cantidad = detalle['cantidad']

            # A. Registrar el detalle con precio unitario.
            DetalleCompra.objects.create(
                compra=compra,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=detalle['precio_unitario']
            )

            # B. Registrar el movimiento de stock de tipo entrada.
            StockMovimiento.objects.create(
                producto=producto,
                tipo="entrada",
                sector_destino=deposito,
                cantidad=cantidad
            )
            # Este movimiento crea la traza de inventario para que el sistema sepa
            # que el producto ingresó al depósito tras la compra.

        return compra