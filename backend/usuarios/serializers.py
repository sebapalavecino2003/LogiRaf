from rest_framework import serializers
from .models import Usuario , Rol

class UsuarioSerializer(serializers.ModelSerializer):
    class Meta:
        model = Usuario
        fields = ['id_usuario', 'first_name', 'last_name', 'username', 'rol']

class UsuarioCreateSerializer(serializers.ModelSerializer):
    # La definimos como write_only para que se pida al crear pero no se muestre al consultar
    password = serializers.CharField(
        write_only=True, 
        required=True, 
        style={'input_type': 'password'}
    )

    class Meta:
        model = Usuario
        fields = ['id_usuario', 'username', 'first_name', 'last_name', 'rol', 'password']
        read_only_fields = ['id_usuario']

    def create(self, validated_data):
        # 1. Extraemos la password antes de crear el objeto
        password_plana = validated_data.pop('password')
        
        # 2. Creamos la instancia del usuario sin la password todavía
        usuario = Usuario(**validated_data)
        
        # 3. ASIGNACIÓN SEGURA: Encriptamos la clave en la base de datos de tu Ubuntu
        usuario.set_password(password_plana)
        
        # 4. Guardamos
        usuario.save()
        return usuario

class RolSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['id_rol', 'nombre_rol']

class RolCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Rol
        fields = ['nombre_rol', 'id_rol']
        read_only_fields = ['id_rol']