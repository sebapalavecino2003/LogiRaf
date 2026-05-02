from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
   CompraViewSet,
   DetalleCompraViewSet,
   ComprobanteCompraViewSet
)

router = DefaultRouter()

# NOTA: Registramos de lo más específico a lo más general
router.register(r'comprobantes', ComprobanteCompraViewSet, basename='comprobante-compra')
router.register(r'detalles', DetalleCompraViewSet, basename='detalle-compra')
router.register(r'crear', CompraViewSet, basename='compra-crear')
router.register(r'', CompraViewSet, basename='compras-listado')

urlpatterns = [
    path('', include(router.urls)),
]