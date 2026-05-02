# backend/ventas/services.py
from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import Venta, DetalleVenta, Comprobante
from inventario.models import Sector
from inventario.services import StockService
import uuid

class VentaService:
    """Lógica de negocio de ventas"""
    
    @staticmethod
    @transaction.atomic
    def crear_venta(vendedor, items_data):
        """
        items_data = [
            {'producto': Producto, 'cantidad': int}
        ]
        """
        sector_salon = Sector.objects.get(tipo='SALON')
        total = 0
        
        # 1. Validar stock para todos
        for item in items_data:
            producto = item['producto']
            cantidad = item['cantidad']
            
            stock = producto.stockporsector_set.get(sector=sector_salon)
            if stock.cantidad < cantidad:
                raise ValidationError(
                    f"Stock insuficiente para {producto.nombre_producto}. "
                    f"Disponible: {stock.cantidad}"
                )
            
            total += cantidad * producto.precio_unitario
        
        # 2. Crear comprobante
        ticket_nro = f"TKT-{uuid.uuid4().hex[:6].upper()}"
        comprobante = Comprobante.objects.create(numero_comprobante=ticket_nro)
        
        # 3. Crear venta
        venta = Venta.objects.create(
            vendedor=vendedor,
            comprobante=comprobante
        )
        
        # 4. Procesar detalles y descontar stock
        for item in items_data:
            producto = item['producto']
            cantidad = item['cantidad']
            precio_momento = producto.precio_unitario
            
            # Crear detalle
            DetalleVenta.objects.create(
                venta=venta,
                producto=producto,
                cantidad=cantidad,
                precio_unitario_venta=precio_momento
            )
            
            # Descontar stock
            StockService.salida_stock(
                producto=producto,
                cantidad=cantidad,
                sector=sector_salon
            )
        
        return venta