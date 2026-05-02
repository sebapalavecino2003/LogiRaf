# backend/compras/views.py
from rest_framework import viewsets, permissions
from .models import Compra, DetalleCompra, ComprobanteCompra
from .serializers import CompraSerializer, DetalleCompraSerializer, ComprobanteCompraSerializer
from usuarios.permisos import EsResponsableAbastecimiento

class CompraViewSet(viewsets.ModelViewSet):
    """Vista principal de compras"""
    permission_classes = [EsResponsableAbastecimiento]
    queryset = Compra.objects.select_related(
        'responsable_abastecimiento', 
        'comprobante_detalle'
    ).prefetch_related('detalles__producto')
    serializer_class = CompraSerializer

class DetalleCompraViewSet(viewsets.ReadOnlyModelViewSet):
    """Los detalles se crean a través de Compra, no directamente"""
    queryset = DetalleCompra.objects.select_related('compra', 'producto')
    serializer_class = DetalleCompraSerializer

class ComprobanteCompraViewSet(viewsets.ReadOnlyModelViewSet):
    """Los comprobantes se generan automáticamente"""
    queryset = ComprobanteCompra.objects.select_related('compra')
    serializer_class = ComprobanteCompraSerializer