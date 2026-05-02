from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    CategoriaViewSet,
    ProductoViewSet,
    SectorViewSet,
    StockPorSectorViewSet,
    StockMovimientoViewSet
)

router = DefaultRouter()

router.register(r'categorias', CategoriaViewSet, basename='categoria')
router.register(r'productos', ProductoViewSet, basename='producto')
router.register(r'sectores', SectorViewSet, basename='sector')
router.register(r'stockporsector', StockPorSectorViewSet, basename='stockporsector')
router.register(r'stockmovimiento', StockMovimientoViewSet, basename='stockmovimiento')

urlpatterns = [
    path('', include(router.urls)),
]