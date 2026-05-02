from rest_framework import viewsets, mixins
from .models import Usuario , Rol
from .serializers import UsuarioSerializer, UsuarioCreateSerializer , RolSerializer

# Esta solo para VER (Listar y ver detalle)
class UsuarioListViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioSerializer

# Esta solo para CREAR
class UsuarioCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Usuario.objects.all()
    serializer_class = UsuarioCreateSerializer

class RolViewSet(viewsets.ReadOnlyModelViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

class RolCreateViewSet(mixins.CreateModelMixin, viewsets.GenericViewSet):
    queryset = Rol.objects.all()
    serializer_class = RolSerializer

