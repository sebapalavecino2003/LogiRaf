# backend/inventario/views.py
from rest_framework import viewsets, permissions
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
    """Gestión de categorías"""
    queryset = Categoria.objects.all()
    serializer_class = CategoriaSerializer

class ProductoViewSet(viewsets.ModelViewSet):
    """Gestión de productos - solo lectura de stock desde StockPorSector"""
    queryset = Producto.objects.select_related('categoria').prefetch_related(
        'stockporsector_set__sector'
    )
    serializer_class = ProductoSerializer

class SectorViewSet(viewsets.ReadOnlyModelViewSet):
    """Los sectores son datos maestros, no se crean por API"""
    queryset = Sector.objects.all()
    serializer_class = SectorSerializer

class StockPorSectorViewSet(viewsets.ReadOnlyModelViewSet):
    """Solo lectura - el stock se modifica a través de operaciones (compras/ventas)"""
    queryset = StockPorSector.objects.select_related(
        'producto__categoria',
        'sector'
    )
    serializer_class = StockPorSectorSerializer

class StockMovimientoViewSet(viewsets.ReadOnlyModelViewSet):
    """Auditoría de movimientos de stock - solo lectura"""
    queryset = StockMovimiento.objects.select_related(
        'producto',
        'sector_origen',
        'sector_destino'
    )
    serializer_class = StockMovimientoSerializer