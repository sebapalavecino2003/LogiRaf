from django.db import models
from django.core.exceptions import ValidationError


class Categoria(models.Model):
    id_categoria = models.AutoField(primary_key=True)
    nombre_categoria = models.CharField(max_length=100)

    def __str__(self):
        return self.nombre_categoria


class Producto(models.Model):
    id_producto = models.AutoField(primary_key=True)
    nombre_producto = models.CharField(max_length=200)
    marca = models.CharField(max_length=100)
    talle = models.CharField(max_length=50, blank=True, null=True)
    descripcion_producto = models.TextField(blank=True, null=True)
    precio_unitario = models.DecimalField(max_digits=10, decimal_places=4)
    categoria = models.ForeignKey(Categoria, on_delete=models.PROTECT)

    def __str__(self):
        return self.nombre_producto


class Sector(models.Model):
    SECTORES_CHOICES = [
        ('DEPOSITO', 'Depósito'),
        ('SALON', 'Salón de ventas'),
    ]

    tipo = models.CharField(max_length=20, choices=SECTORES_CHOICES, unique=True)
    descripcion = models.TextField(blank=True)

    def __str__(self):
        return self.get_tipo_display()


class StockPorSector(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)
    sector = models.ForeignKey(Sector, on_delete=models.CASCADE)
    cantidad = models.PositiveIntegerField()

    class Meta:
        unique_together = ('producto', 'sector')


class StockMovimiento(models.Model):
    producto = models.ForeignKey(Producto, on_delete=models.CASCADE)

    tipo = models.CharField(max_length=20, choices=[
        ("entrada", "entrada"),
        ("salida", "salida"),
        ("transferencia", "transferencia")
    ])

    sector_origen = models.ForeignKey(
        Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name="origen"
    )

    sector_destino = models.ForeignKey(
        Sector, on_delete=models.SET_NULL, null=True, blank=True, related_name="destino"
    )

    cantidad = models.PositiveIntegerField()
    fecha = models.DateTimeField(auto_now_add=True)

    def clean(self):
        if self.tipo == "entrada" and not self.sector_destino:
            raise ValidationError("Entrada requiere sector destino")

        if self.tipo == "salida" and not self.sector_origen:
            raise ValidationError("Salida requiere sector origen")

        if self.tipo == "transferencia":
            if not self.sector_origen or not self.sector_destino:
                raise ValidationError("Transferencia requiere origen y destino")

    def save(self, *args, **kwargs):
        self.clean()
        super().save(*args, **kwargs)