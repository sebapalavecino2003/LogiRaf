#!/usr/bin/env python
"""Utilidad de línea de comandos de Django para tareas administrativas."""
import os
import sys


def main():
    """Configura Django y ejecuta la tarea solicitada desde la línea de comandos."""
    # Definimos la configuración de Django que usará este proyecto.
    os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'config.settings')
    try:
        from django.core.management import execute_from_command_line
    except ImportError as exc:
        raise ImportError(
            "No se puede importar Django. Asegúrate de que esté instalado "
            "y activado el entorno virtual o que el PYTHONPATH sea correcto."
        ) from exc
    # Ejecuta el comando recibido por sys.argv, como runserver, makemigrations, migrate, etc.
    execute_from_command_line(sys.argv)


if __name__ == '__main__':
    main()
