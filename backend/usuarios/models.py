from django.db import models
from django.contrib.auth.models import AbstractUser, UserManager


class Rol(models.Model):
    """Representa un rol del usuario dentro del sistema."""
    ROLES_CHOICES = [
        ('OPERADOR_DEPOSITO', 'Operador de deposito'),
        ('ENCARGADO_DEPOSITO', 'Encargado de deposito'),
        ('REPOSITOR', 'Repositor'),
        ('ENCARGADO_SALON', 'Encargado de salón'),
        ('ENCARGADO_CAJA', 'Encargado de caja'),
        ('RESPONSABLE_ABASTECIMIENTO', 'Responsable de abastecimiento'),
        ('ADMINISTRADOR_SISTEMA', 'Administrador del sistema'),
    ]
    id_rol = models.AutoField(primary_key=True)
    # nombre_rol es la cadena que identifica el rol y se guarda con opciones fijas.
    nombre_rol = models.CharField(max_length=50, choices=ROLES_CHOICES, unique=True)

    def __str__(self):
        # Devuelve el nombre del rol para mostrar en interfaces y registros.
        return self.nombre_rol


class UsuarioManager(UserManager):
    def create_superuser(self, username, email=None, password=None, **extra_fields):
        if 'rol' not in extra_fields or extra_fields['rol'] is None:
            rol_admin, _ = Rol.objects.get_or_create(
                nombre_rol='ADMINISTRADOR_SISTEMA',
                defaults={'nombre_rol': 'ADMINISTRADOR_SISTEMA'},
            )
            extra_fields['rol'] = rol_admin
        return super().create_superuser(username, email=email, password=password, **extra_fields)


class Usuario(AbstractUser):
    id_usuario = models.AutoField(primary_key=True)
    nombre_completo = models.CharField(max_length=150, blank=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)

    objects = UsuarioManager()

    def __str__(self):
        return f"{self.username} - {self.rol.nombre_rol}"