# backend/compras/services.py
from django.db import transaction
from django.core.exceptions import ValidationError
from rest_framework import serializers
from .models import Compra, DetalleCompra, ComprobanteCompra
from inventario.models import Sector
from inventario.services import StockService
import uuid

class CompraService:
    """Lógica de negocio de compras"""
    
    @staticmethod
    @transaction.atomic
    def crear_compra(responsable, items_data):
        """
        items_data = [
            {'producto': Producto, 'cantidad': int, 'precio_unitario': Decimal}
        ]
        """
        # 1. Validar que todos los productos existan
        for item in items_data:
            if not item['producto'].id_producto:
                raise ValidationError("Producto no válido")
        
        # 2. Crear cabecera
        total = sum(item['cantidad'] * item['precio_unitario'] for item in items_data)
        
        compra = Compra.objects.create(
            responsable_abastecimiento=responsable,
            total_compra=total
        )
        
        # 3. Crear comprobante
        ticket_nro = f"CMP-{uuid.uuid4().hex[:6].upper()}"
        ComprobanteCompra.objects.create(
            compra=compra,
            numero_comprobante=ticket_nro
        )
        
        # 4. Procesar detalles y stock
        sector_deposito = Sector.objects.get(tipo='DEPOSITO')
        
        for item in items_data:
            producto = item['producto']
            cantidad = item['cantidad']
            precio = item['precio_unitario']
            
            # Crear detalle
            DetalleCompra.objects.create(
                compra=compra,
                producto=producto,
                cantidad=cantidad,
                precio_unitario=precio
            )
            
            # Actualizar stock mediante servicio
            StockService.entrada_stock(
                producto=producto,
                cantidad=cantidad,
                sector=sector_deposito
            )
        
        return compra