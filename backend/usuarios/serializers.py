from rest_framework import serializers
from .models import Usuario, Rol
from .services import UsuarioService


class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id_rol', 'nombre_rol']


class UsuarioSerializer(serializers.ModelSerializer):
    rol = RolSerializer(read_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'first_name', 'last_name', 'rol']


class UsuarioCreateSerializer(serializers.ModelSerializer):
    password = serializers.CharField(write_only=True)

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'first_name', 'last_name', 'rol', 'password']

    def create(self, validated_data):
        return UsuarioService.crear_usuario(validated_data)