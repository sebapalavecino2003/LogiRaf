# backend/ventas/views.py
from rest_framework import viewsets, permissions, status
from rest_framework.response import Response
from .models import Venta, DetalleVenta, Comprobante
from .serializers import (
    VentaSerializer,
    DetalleVentaSerializer,
    ComprobanteSerializer
)
from usuarios.permisos import EsVendedor

class VentaViewSet(viewsets.ModelViewSet):
    """Vista principal de ventas"""
    permission_classes = [EsVendedor]
    queryset = Venta.objects.select_related(
        'vendedor', 
        'comprobante'
    ).prefetch_related('items__producto')
    serializer_class = VentaSerializer

    def get_permissions(self):
        """Permite ver ventas a cualquiera, pero solo vendedores crean"""
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

class DetalleVentaViewSet(viewsets.ReadOnlyModelViewSet):
    """Los detalles se crean a través de Venta, no directamente"""
    queryset = DetalleVenta.objects.select_related('venta', 'producto')
    serializer_class = DetalleVentaSerializer

class ComprobanteViewSet(viewsets.ReadOnlyModelViewSet):
    """Los comprobantes se generan automáticamente"""
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer