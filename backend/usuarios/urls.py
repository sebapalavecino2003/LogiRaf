from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RolViewSet

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'roles', RolViewSet)

urlpatterns = [
    path('', include(router.urls)),
]