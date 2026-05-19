from django.contrib import admin
from django.urls import include, path, re_path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

from .views import spa_fallback

# Rutas principales del proyecto.
urlpatterns = [
    path('admin/', admin.site.urls),  # Interfaz de administración de Django.

    # Autenticación JWT.
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),

    # APIs de las aplicaciones del sistema.
    path('api/usuarios/', include('usuarios.urls')),
    path('api/inventario/', include('inventario.urls')),
    path('api/ventas/', include('ventas.urls')),
    path('api/compras/', include('compras.urls')),
]

# SPA fallback: sirve index.html para cualquier ruta que no sea API ni admin.
# Requiere ejecutar `npm run build` en frontend/ primero.
urlpatterns += [
    re_path(r'^(?!api/|admin/).*$', spa_fallback),
]