from rest_framework import serializers
from .models import Producto, Categoria, Sector, StockPorSector, StockMovimiento
from .services import StockService


class CategoriaSerializer(serializers.ModelSerializer):
    class Meta:
        model = Categoria
        fields = '__all__'


class ProductoSerializer(serializers.ModelSerializer):
    categoria = CategoriaSerializer(read_only=True)

    id_categoria = serializers.PrimaryKeyRelatedField(
        queryset=Categoria.objects.all(),
        source='categoria',
        write_only=True
    )

    class Meta:
        model = Producto
        fields = [
            'id_producto',
            'nombre_producto',
            'marca',
            'talle',
            'descripcion_producto',
            'precio_unitario',
            'categoria',
            'id_categoria'
        ]


class SectorSerializer(serializers.ModelSerializer):
    class Meta:
        model = Sector
        fields = '__all__'


class StockPorSectorSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)
    sector = SectorSerializer(read_only=True)

    id_producto = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        source='producto',
        write_only=True
    )

    id_sector = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
        source='sector',
        write_only=True
    )

    class Meta:
        model = StockPorSector
        fields = [
            'id',
            'producto',
            'sector',
            'cantidad',
            'id_producto',
            'id_sector'
        ]


class StockMovimientoSerializer(serializers.ModelSerializer):
    producto = ProductoSerializer(read_only=True)

    id_producto = serializers.PrimaryKeyRelatedField(
        queryset=Producto.objects.all(),
        source='producto',
        write_only=True
    )

    id_sector_origen = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
        source='sector_origen',
        allow_null=True,
        required=False
    )

    id_sector_destino = serializers.PrimaryKeyRelatedField(
        queryset=Sector.objects.all(),
        source='sector_destino',
        allow_null=True,
        required=False
    )

    class Meta:
        model = StockMovimiento
        fields = [
            'id',
            'producto',
            'tipo',
            'cantidad',
            'sector_origen',
            'sector_destino',
            'id_producto',
            'id_sector_origen',
            'id_sector_destino',
            'fecha'
        ]

    def create(self, validated_data):
        movimiento = StockMovimiento.objects.create(**validated_data)

        # 🔥 lógica en service
        StockService.procesar_movimiento(movimiento)

        return movimiento