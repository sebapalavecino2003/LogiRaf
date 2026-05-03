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

router.register(r'categorias', CategoriaViewSet)
router.register(r'productos', ProductoViewSet)
router.register(r'sectores', SectorViewSet)
router.register(r'stockporsector', StockPorSectorViewSet)
router.register(r'stockmovimiento', StockMovimientoViewSet)

urlpatterns = [
    path('', include(router.urls)),
]