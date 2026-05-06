from rest_framework import permissions

# ============ CLASES DE PERMISOS PARA DRF ============
# Este archivo centraliza las reglas de autorización basadas en roles.

class EsAdmin(permissions.BasePermission):
    """Permiso que permite únicamente al personal administrativo (is_staff)."""

    def has_permission(self, request, view):
        return request.user and request.user.is_staff


class TieneRol(permissions.BasePermission):
    """Permiso base que comprueba un rol específico en el usuario."""

    rol_requerido = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        # Un usuario staff puede hacer todo, independientemente del rol.
        if request.user.is_staff:
            return True
        
        if self.rol_requerido:
            # Compara el rol del usuario con el rol requerido por la clase.
            return request.user.rol.nombre_rol == self.rol_requerido
        
        return False

class EsOperadorDeposito(TieneRol):
    """Permiso para usuarios con rol OPERADOR_DEPOSITO."""
    rol_requerido = 'OPERADOR_DEPOSITO'


class EsEncargadoDeposito(TieneRol):
    """Permiso para usuarios con rol ENCARGADO_DEPOSITO."""
    rol_requerido = 'ENCARGADO_DEPOSITO'


class EsVendedor(TieneRol):
    """Permiso para usuarios que pueden registrar ventas."""
    rol_requerido = 'ENCARGADO_CAJA'  # O 'VENDEDOR' si ese es el nombre del rol


class EsRepositor(TieneRol):
    """Permiso para usuarios con rol REPOSITOR."""
    rol_requerido = 'REPOSITOR'


class EsEncargadoSalon(TieneRol):
    """Permiso para usuarios con rol ENCARGADO_SALON."""
    rol_requerido = 'ENCARGADO_SALON'


class EsResponsableAbastecimiento(TieneRol):
    """Permiso para usuarios que pueden registrar compras y abastecimiento."""
    rol_requerido = 'RESPONSABLE_ABASTECIMIENTO'


class PuedeIngresarMercaderia(permissions.BasePermission):
    """Permiso para ingresar mercadería en el depósito."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        roles_permitidos = ['OPERADOR_DEPOSITO', 'ENCARGADO_DEPOSITO']
        return request.user.rol.nombre_rol in roles_permitidos
    


class PuedeAprobarMovimientos(permissions.BasePermission):
    """Permiso para aprobar movimientos de stock en el depósito."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.user.rol.nombre_rol == 'ENCARGADO_DEPOSITO'


class PuedeRegistrarVenta(permissions.BasePermission):
    """Permiso para registrar ventas en caja o salón."""

    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        roles_permitidos = ['ENCARGADO_CAJA', 'REPOSITOR']
        return request.user.rol.nombre_rol in roles_permitidos
