from rest_framework import serializers
from .models import Usuario, Rol
from .services import UsuarioService


class RolSerializer(serializers.ModelSerializer):
    """Serializador para el modelo Rol que devuelve id y nombre del rol."""

    class Meta:
        model = Rol
        fields = ['id_rol', 'nombre_rol']


class UsuarioSerializer(serializers.ModelSerializer):
    """Serializador para mostrar usuarios con el rol anidado como objeto."""

    rol = RolSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'first_name', 'last_name', 'rol']


class UsuarioCreateSerializer(serializers.ModelSerializer):
    """Serializador usado para recibir contraseña y crear un usuario nuevo."""

    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'first_name', 'last_name', 'rol', 'password']

    def create(self, validated_data):
        """Invoca el servicio de usuario para validar y guardar el nuevo registro."""
        return UsuarioService.crear_usuario(validated_data)

        return UsuarioService.crear_usuario(validated_data)