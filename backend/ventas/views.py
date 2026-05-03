from rest_framework import permissions, viewsets
from .models import Venta, DetalleVenta, Comprobante
from .serializers import (
    VentaSerializer,
    DetalleVentaSerializer,
    ComprobanteSerializer
)
from usuarios.permisos import EsVendedor


class VentaViewSet(viewsets.ModelViewSet):
    permission_classes = [EsVendedor]

    queryset = Venta.objects.select_related(
        'vendedor',
        'comprobante'
    ).prefetch_related('items__producto').order_by('-fecha_venta')

    serializer_class = VentaSerializer

    def get_permissions(self):
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]


class DetalleVentaViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer


class ComprobanteViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer