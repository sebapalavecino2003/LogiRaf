from django.db import models
from django.contrib.auth.models import AbstractUser


class Rol(models.Model):
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
    nombre_rol = models.CharField(max_length=50, choices=ROLES_CHOICES, unique=True)

    def __str__(self):
        return self.nombre_rol


class Usuario(AbstractUser):
    id_usuario = models.AutoField(primary_key=True)
    nombre_completo = models.CharField(max_length=150, blank=True)
    rol = models.ForeignKey(Rol, on_delete=models.PROTECT)

    def __str__(self):
        return f"{self.username} - {self.rol.nombre_rol}"