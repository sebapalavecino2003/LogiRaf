from django.db import models
from django.conf import settings
from inventario.models import Producto


class Compra(models.Model):
    """Registra una compra realizada por el responsable de abastecimiento."""

    id_compra = models.AutoField(primary_key=True)
    fecha_compra = models.DateTimeField(auto_now_add=True)
    total_compra = models.DecimalField(max_digits=10, decimal_places=4)

    responsable_abastecimiento = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.PROTECT,
        limit_choices_to={'rol__nombre_rol': 'RESPONSABLE_ABASTECIMIENTO'}
    )
    # El campo responsable_abastecimiento apunta al usuario que realizó la compra.

    def __str__(self):
        return f"Compra {self.id_compra}"


class DetalleCompra(models.Model):
    """Representa cada línea de detalle de productos dentro de una compra."""

    compra = models.ForeignKey(Compra, related_name='detalles', on_delete=models.CASCADE)
    producto = models.ForeignKey(Producto, on_delete=models.PROTECT)
    cantidad = models.PositiveIntegerField()
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=4)


class ComprobanteCompra(models.Model):
    """Almacena el comprobante fiscal o factura asociado a una compra."""

    compra = models.OneToOneField(Compra, related_name='comprobante_detalle', on_delete=models.CASCADE)
    numero_comprobante = models.CharField(max_length=100, unique=True)
    fecha_emision = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return self.numero_comprobante