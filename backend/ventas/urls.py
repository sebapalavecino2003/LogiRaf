from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import ( VentaViewSet, DetalleVentaViewSet, ComprobanteViewSet
)

router = DefaultRouter()
router.register(r'', VentaViewSet, basename='venta')
router.register(r'detalles', DetalleVentaViewSet, basename='detalleventa')
router.register(r'comprobantes', ComprobanteViewSet, basename='comprobante')
urlpatterns = [
    path('', include(router.urls)),
]