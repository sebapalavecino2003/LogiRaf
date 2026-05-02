from rest_framework import permissions, viewsets, status
from rest_framework.response import Response
from .models import Comprobante, Venta, DetalleVenta
from .serializers import (
    ComprobanteSerializer,
    VentaSerializer,
    DetalleVentaSerializer,
    VentaDetalleListSerializer,
)
# Usamos los permisos que definiste para tu entorno Linux
from usuarios.permisos import EsVendedor 

class VentaViewSet(viewsets.ModelViewSet):
    # Aplicamos el permiso de vendedor para crear/editar
    permission_classes = [EsVendedor]
    queryset = Venta.objects.all().order_by('-fecha_venta')
    serializer_class = VentaSerializer

    def get_permissions(self):
        """Permite ver las ventas a cualquier usuario, pero solo el vendedor crea"""
        if self.request.method in permissions.SAFE_METHODS:
            return [permissions.AllowAny()]
        return [permission() for permission in self.permission_classes]

    def get_serializer_class(self):
        """
        Usamos un serializer más liviano para el listado 
        y el completo para la creación (POST)
        """
        if self.action == 'list':
            # Si quieres listar las ventas con sus detalles anidados
            return VentaSerializer 
        return super().get_serializer_class()

    def list(self, request, *args, **kwargs):
        """
        Corregido: Ahora devuelve la lista de Ventas. 
        Si quieres ver los detalles de cada venta, el VentaSerializer ya los trae.
        """
        queryset = self.get_queryset().select_related('vendedor', 'comprobante').prefetch_related('items__producto')
        page = self.paginate_queryset(queryset)
        if page is not None:
            serializer = self.get_serializer(page, many=True)
            return self.get_paginated_response(serializer.data)

        serializer = self.get_serializer(queryset, many=True)
        return Response(serializer.data)

class DetalleVentaViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Generalmente los detalles no se crean solos, se crean a través de la Venta.
    Por eso lo ponemos como ReadOnly.
    """
    queryset = DetalleVenta.objects.all()
    serializer_class = DetalleVentaSerializer

class ComprobanteViewSet(viewsets.ReadOnlyModelViewSet):
    """
    Los comprobantes se generan automáticamente al vender.
    """
    queryset = Comprobante.objects.all()
    serializer_class = ComprobanteSerializer