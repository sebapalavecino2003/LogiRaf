# backend/inventario/services.py
from django.db import transaction
from django.core.exceptions import ValidationError
from .models import StockPorSector, Producto, Sector, StockMovimiento

class StockService:
    """Centraliza toda la lógica de stock"""
    
    @staticmethod
    @transaction.atomic
    def entrada_stock(producto: Producto, cantidad: int, sector: Sector):
        """Registra entrada de stock"""
        if cantidad <= 0:
            raise ValidationError("Cantidad debe ser > 0")
        
        obj, _ = StockPorSector.objects.get_or_create(
            producto=producto,
            sector=sector,
            defaults={'cantidad': 0}
        )
        obj.cantidad += cantidad
        obj.save()
        
        # Registrar movimiento
        StockMovimiento.objects.create(
            producto=producto,
            tipo='entrada',
            sector_destino=sector,
            cantidad=cantidad
        )
    
    @staticmethod
    @transaction.atomic
    def salida_stock(producto: Producto, cantidad: int, sector: Sector):
        """Registra salida de stock"""
        if cantidad <= 0:
            raise ValidationError("Cantidad debe ser > 0")
        
        obj = StockPorSector.objects.get(
            producto=producto,
            sector=sector
        )
        
        if obj.cantidad < cantidad:
            raise ValidationError(f"Stock insuficiente en {sector}. Disponible: {obj.cantidad}")
        
        obj.cantidad -= cantidad
        obj.save()
        
        # Registrar movimiento
        StockMovimiento.objects.create(
            producto=producto,
            tipo='salida',
            sector_origen=sector,
            cantidad=cantidad
        )