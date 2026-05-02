from django.db import models
from usuarios.models import Usuario
from inventario.models import Producto

class Comprobante(models.Model):
    id_comprobante = models.AutoField(primary_key=True)
    numero_comprobante = models.CharField(max_length=50, unique=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.numero_comprobante
class Venta(models.Model):
    id_venta = models.AutoField(primary_key=True)
    fecha_venta = models.DateTimeField(auto_now_add=True)
    comprobante = models.OneToOneField(Comprobante, on_delete=models.PROTECT) 
    
    # AQUÍ va el responsable: El que está atendiendo el local en ese momento
    vendedor = models.ForeignKey(
        Usuario, 
        on_delete=models.PROTECT,
        # Filtramos para que solo aparezcan los que pueden vender (Cajeros, Encargados, etc.)
        limit_choices_to={'rol__nombre_rol__in': ['ENCARGADO_CAJA', 'ENCARGADO_SALON']}
    )

    def __str__(self):
        return f"Venta {self.id_venta} - {self.vendedor.username}"

class DetalleVenta(models.Model):
    id_detalle = models.AutoField(primary_key=True)
    venta = models.ForeignKey(Venta, on_delete=models.CASCADE, related_name='items')
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    
    # Es muy importante guardar el precio al que se vendió en ese momento
    # por si el precio del producto sube mañana en la tabla Producto
    precio_unitario_venta = models.DecimalField(max_digits=10, decimal_places=2)

    def __str__(self):
        return f"{self.producto.nombre_producto} x {self.cantidad}"