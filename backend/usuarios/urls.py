from django.urls import path, include
from rest_framework.routers import DefaultRouter
from .views import UsuarioViewSet, RolViewSet, me

router = DefaultRouter()
router.register(r'usuarios', UsuarioViewSet)
router.register(r'roles', RolViewSet)

urlpatterns = [
    # Incluye todas las rutas generadas automáticamente por el router.
    path('', include(router.urls)),
    # Ruta para obtener el perfil del usuario autenticado.
    path('me/', me, name='me'),
]
