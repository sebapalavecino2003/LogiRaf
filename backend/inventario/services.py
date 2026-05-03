from django.db import transaction
from django.core.exceptions import ValidationError

from .models import StockPorSector


class StockService:

    @staticmethod
    @transaction.atomic
    def procesar_movimiento(movimiento):

        if movimiento.tipo == "entrada":
            StockService._entrada(movimiento)

        elif movimiento.tipo == "salida":
            StockService._salida(movimiento)

        elif movimiento.tipo == "transferencia":
            StockService._transferencia(movimiento)

    @staticmethod
    def _entrada(movimiento):
        obj, _ = StockPorSector.objects.get_or_create(
            producto=movimiento.producto,
            sector=movimiento.sector_destino
        )
        obj.cantidad += movimiento.cantidad
        obj.save()

    @staticmethod
    def _salida(movimiento):
        obj = StockPorSector.objects.get(
            producto=movimiento.producto,
            sector=movimiento.sector_origen
        )

        if obj.cantidad < movimiento.cantidad:
            raise ValidationError("Stock insuficiente")

        obj.cantidad -= movimiento.cantidad
        obj.save()

    @staticmethod
    def _transferencia(movimiento):
        origen = StockPorSector.objects.get(
            producto=movimiento.producto,
            sector=movimiento.sector_origen
        )

        if origen.cantidad < movimiento.cantidad:
            raise ValidationError("Stock insuficiente")

        destino, _ = StockPorSector.objects.get_or_create(
            producto=movimiento.producto,
            sector=movimiento.sector_destino
        )

        origen.cantidad -= movimiento.cantidad
        destino.cantidad += movimiento.cantidad

        origen.save()
        destino.save()