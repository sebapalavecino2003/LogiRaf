from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import VentaViewSet, DetalleVentaViewSet, ComprobanteViewSet

router = DefaultRouter()
router.register(r'ventas', VentaViewSet)
router.register(r'detalles', DetalleVentaViewSet)
router.register(r'comprobantes', ComprobanteViewSet)

urlpatterns = [
    path('', include(router.urls)),
]