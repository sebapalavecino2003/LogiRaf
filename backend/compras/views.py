from rest_framework import viewsets
from .models import Compra
from .serializers import CompraSerializer
from usuarios.permisos import EsResponsableAbastecimiento


class CompraViewSet(viewsets.ModelViewSet):
    """ViewSet que expone la API de compras para el responsable de abastecimiento."""

    permission_classes = [EsResponsableAbastecimiento]
    # Solo los usuarios con rol de responsable de abastecimiento pueden acceder.

    queryset = Compra.objects.select_related(
        'responsable_abastecimiento',
        'comprobante_detalle'
    ).prefetch_related('detalles')
    # Se optimiza la consulta para traer datos relacionados en una sola operación.

    serializer_class = CompraSerializer
    # Usa CompraSerializer para validar y crear las compras y sus detalles.