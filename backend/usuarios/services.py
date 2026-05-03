from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError

Usuario = get_user_model()


class UsuarioService:

    @staticmethod
    def crear_usuario(data):
        username = data.get("username")
        password = data.get("password")

        if not username:
            raise ValidationError("El username es obligatorio")

        if not password:
            raise ValidationError("La contraseña es obligatoria")

        if Usuario.objects.filter(username=username).exists():
            raise ValidationError("El username ya existe")

        usuario = Usuario(
            username=username,
            first_name=data.get("first_name", ""),
            last_name=data.get("last_name", ""),
            rol=data.get("rol"),
        )

        usuario.set_password(password)
        usuario.save()

        return usuario