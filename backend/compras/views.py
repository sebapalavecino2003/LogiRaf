from rest_framework import viewsets
from .models import Compra
from .serializers import CompraSerializer
from usuarios.permisos import EsResponsableAbastecimiento


class CompraViewSet(viewsets.ModelViewSet):
    permission_classes = [EsResponsableAbastecimiento]

    queryset = Compra.objects.select_related(
        'responsable_abastecimiento',
        'comprobante_detalle'
    ).prefetch_related('detalles')

    serializer_class = CompraSerializer