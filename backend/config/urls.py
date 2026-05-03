from django.contrib import admin
from django.urls import include, path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
)

urlpatterns = [
    path('admin/', admin.site.urls),

    # Auth
    path('api/auth/login/', TokenObtainPairView.as_view()),
    path('api/auth/refresh/', TokenRefreshView.as_view()),

    # Apps (versionadas)
    path('api/v1/usuarios/', include('usuarios.urls')),
    path('api/v1/inventario/', include('inventario.urls')),
    path('api/v1/ventas/', include('ventas.urls')),
    path('api/v1/compras/', include('compras.urls')),
]