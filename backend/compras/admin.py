from django.contrib import admin
from .models import Compra, DetalleCompra, ComprobanteCompra

# Registra los modelos de compras en el panel de administración de Django
# para poder ver y editar compras, sus detalles y comprobantes desde el admin.
admin.site.register([Compra, DetalleCompra, ComprobanteCompra])
