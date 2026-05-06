"""Configuración WSGI para el proyecto Django."""

import os

from django.core.wsgi import get_wsgi_application

# Define el módulo de configuración que Django debe usar.
os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')

# Objeto WSGI usado por servidores de aplicaciones compatibles con WSGI.
application = get_wsgi_application()
