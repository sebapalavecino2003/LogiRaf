from django.contrib import admin
from django.contrib.auth.admin import UserAdmin
from .models import Usuario, Rol


@admin.register(Usuario)
class UsuarioAdmin(UserAdmin):
    """Configuración de administración para el usuario personalizado."""

    # Agrega campos personalizados al formulario de edición de usuario.
    fieldsets = UserAdmin.fieldsets + (
        ('Información adicional', {'fields': ('nombre_completo', 'rol')}),
    )
    # Agrega campos adicionales al formulario de creación de usuario.
    add_fieldsets = UserAdmin.add_fieldsets + (
        ('Información adicional', {'fields': ('nombre_completo', 'rol')}),
    )


# Registrar el modelo Rol para que pueda administrarse desde Django Admin.
admin.site.register(Rol)
