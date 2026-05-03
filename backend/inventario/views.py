from rest_framework import viewsets
from .models import (
    Producto,
    Categoria,
    Sector,
    StockPorSector,
    StockMovimiento
)

from .serializers import (
    CategoriaSerializer,
    ProductoSerializer,
    SectorSerializer,
    StockPorSectorSerializer,
    StockMovimientoSerializer
)


class CategoriaViewSet(viewsets.ModelViewSet):
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer


class ProductoViewSet(viewsets.ModelViewSet):
    queryset = Producto.objects.all()
    serializer_class = ProductoSerializer


class SectorViewSet(viewsets.ModelViewSet):
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer


class StockPorSectorViewSet(viewsets.ModelViewSet):
    queryset = StockPorSector.objects.all()
    serializer_class = StockPorSectorSerializer


class StockMovimientoViewSet(viewsets.ModelViewSet):
    queryset = StockMovimiento.objects.all()
    serializer_class = StockMovimientoSerializer