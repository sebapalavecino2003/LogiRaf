from django.contrib import admin
from .models import Categoria, Producto, Sector, StockPorSector, StockMovimiento

admin.site.register([Categoria, Producto, Sector, StockPorSector, StockMovimiento])
