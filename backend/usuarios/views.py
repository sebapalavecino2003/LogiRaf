from rest_framework import viewsets
from rest_framework.decorators import api_view, permission_classes
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, RolSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de usuarios."""

    # Carga anticipada del rol para evitar consultas adicionales.
    queryset = Usuario.objects.select_related('rol').all()

    def get_serializer_class(self):
        # Usa un serializador distinto cuando se crea un usuario para aceptar contraseña.
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer


class RolViewSet(viewsets.ModelViewSet):
    """ViewSet para CRUD de roles."""

    queryset = Rol.objects.all()
    serializer_class = RolSerializer


@api_view(['GET'])
@permission_classes([IsAuthenticated])
def me(request):
    """Devuelve los datos del usuario actualmente autenticado."""
    serializer = UsuarioSerializer(request.user)
    return Response(serializer.data)
