from django.contrib import admin
from .models import Comprobante, Venta, DetalleVenta

admin.site.register([Comprobante, Venta, DetalleVenta])
