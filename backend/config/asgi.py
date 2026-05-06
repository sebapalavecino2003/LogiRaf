"""Configuración ASGI para el proyecto Django."""

import os

from django.core.asgi import get_asgi_application

# Define el módulo de configuración que Django debe usar.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Objeto ASGI que sirve como punto de entrada para servidores compatibles con ASGI.
application = get_asgi_application()
