from rest_framework import viewsets, mixins
from .models import Usuario, Rol
from .serializers import UsuarioSerializer, UsuarioCreateSerializer, RolSerializer


class UsuarioViewSet(viewsets.ModelViewSet):
    queryset = Usuario.objects.select_related('rol').all()

    def get_serializer_class(self):
        if self.action == 'create':
            return UsuarioCreateSerializer
        return UsuarioSerializer


class RolViewSet(viewsets.ModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer