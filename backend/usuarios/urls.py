from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import (
    UsuarioListViewSet, 
    UsuarioCreateViewSet, 
    RolViewSet, 
    RolCreateViewSet
)

router = DefaultRouter()

# Usuarios
router.register(r'listado', UsuarioListViewSet, basename='usuario-listado')
router.register(r'crear', UsuarioCreateViewSet, basename='usuario-crear')

# Roles
# IMPORTANTE: Registrá la ruta más larga PRIMERO para que el router no se confunda
router.register(r'roles/crear', RolCreateViewSet, basename='rol-crear')
router.register(r'roles', RolViewSet, basename='rol-listado')

urlpatterns = [
    path('', include(router.urls)),
]