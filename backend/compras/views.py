from rest_framework import viewsets
from .models import Compra, DetalleCompra, ComprobanteCompra
from .serializers import CompraSerializer, DetalleCompraSerializer, ComprobanteCompraSerializer
from usuarios.permisos import EsResponsableAbastecimiento

class CompraViewSet(viewsets.ModelViewSet):
    permission_classes = [EsResponsableAbastecimiento]
    queryset = Compra.objects.all()
    serializer_class = CompraSerializer

class DetalleCompraViewSet(viewsets.ModelViewSet):
    queryset = DetalleCompra.objects.all()
    serializer_class = DetalleCompraSerializer

class ComprobanteCompraViewSet(viewsets.ModelViewSet):
    queryset = ComprobanteCompra.objects.all()
    serializer_class = ComprobanteCompraSerializer

