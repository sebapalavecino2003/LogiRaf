from rest_framework import permissions

# ============ CLASES DE PERMISOS PARA DRF ============
class EsAdmin(permissions.BasePermission):
    """Solo usuarios administradores"""
    def has_permission(self, request, view):
        return request.user and request.user.is_staff

class TieneRol(permissions.BasePermission):
    rol_requerido = None
    
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False
        
        if request.user.is_staff: # El Admin (is_staff) hace todo
            return True
        
        # CAMBIO AQUÍ: Usamos tu tabla personalizada 'Rol' del diagrama
        if self.rol_requerido:
            # Asumiendo que en tu modelo Usuario tenés un campo 'rol'
            return request.user.rol.nombre_rol == self.rol_requerido
        
        return False

class EsOperadorDeposito(TieneRol):
    rol_requerido = 'OPERADOR_DEPOSITO'


class EsEncargadoDeposito(TieneRol):
    rol_requerido = 'ENCARGADO_DEPOSITO'


class EsVendedor(TieneRol):
    rol_requerido = 'ENCARGADO_CAJA'  # O 'VENDEDOR' si ese es el nombre del rol


class EsRepositor(TieneRol):
    rol_requerido = 'REPOSITOR'


class EsEncargadoSalon(TieneRol):
    rol_requerido = 'ENCARGADO_SALON'


class EsResponsableAbastecimiento(TieneRol):
    rol_requerido = 'RESPONSABLE_ABASTECIMIENTO'


class PuedeIngresarMercaderia(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        roles_permitidos = ['OPERADOR_DEPOSITO', 'ENCARGADO_DEPOSITO']

        return request.user.rol.nombre_rol in roles_permitidos
    


class PuedeAprobarMovimientos(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        return request.user.rol.nombre_rol == 'ENCARGADO_DEPOSITO'


class PuedeRegistrarVenta(permissions.BasePermission):
    def has_permission(self, request, view):
        if not request.user or not request.user.is_authenticated:
            return False

        if request.user.is_staff:
            return True

        roles_permitidos = ['ENCARGADO_CAJA', 'REPOSITOR']

        return request.user.rol.nombre_rol in roles_permitidos