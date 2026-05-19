from pathlib import Path

from django.conf import settings
from django.http import FileResponse, HttpResponseNotFound


def spa_fallback(request):
    index = Path(settings.BASE_DIR.parent / "frontend" / "dist" / "index.html")
    if index.exists():
        return FileResponse(index.open("rb"))
    return HttpResponseNotFound(
        "Frontend no construido. Ejecute 'npm run build' en la carpeta frontend/."
    )
