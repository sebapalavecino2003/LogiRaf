"""Configuración principal del proyecto Django."""

import os
from pathlib import Path

# BASE_DIR apunta al directorio raíz del proyecto backend.
BASE_DIR = Path(__file__).resolve().parent.parent

# -------------------------------------------------------------
# Configuración de seguridad
# -------------------------------------------------------------

# Clave secreta de Django usada para firma de sesiones y CSRF.
# No debe exponerse en producción; este valor solo es adecuado para desarrollo.
SECRET_KEY = 'django-insecure-8x_xoixft_ogbzij(yy89bz213&pqe^s@g4n&e6y8pbbj435w1'

# Debug activado para desarrollo. En producción debe ser False.
DEBUG = True

# Hosts permitidos para acceder al servidor.
ALLOWED_HOSTS = ['*']

# -------------------------------------------------------------
# Aplicaciones instaladas
# -------------------------------------------------------------
INSTALLED_APPS = [
    'corsheaders',  # Permite solicitudes CORS desde el frontend.
    'django.contrib.admin',
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'rest_framework',  # Django REST Framework para APIs.
    'django_extensions',
    'django_filters',
    'usuarios',
    'inventario',
    'compras',
    'ventas',
    # 'reportes',  # App definida pero actualmente deshabilitada.
]

# -------------------------------------------------------------
# Middleware
# -------------------------------------------------------------
MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
    'corsheaders.middleware.CorsMiddleware',  # Procesa cabeceras CORS.
]

ROOT_URLCONF = 'config.urls'

# -------------------------------------------------------------
# Plantillas
# -------------------------------------------------------------
TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
            ],
        },
    },
]

WSGI_APPLICATION = 'config.wsgi.application'

# -------------------------------------------------------------
# Base de datos
# -------------------------------------------------------------
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.mysql',
        'NAME': os.getenv('MYSQL_DATABASE', 'logiraf'),
        'USER': os.getenv('MYSQL_USER', 'logiraf'),
        'PASSWORD': os.getenv('MYSQL_PASSWORD', 'logiraf_dev'),
        'HOST': os.getenv('MYSQL_HOST', 'localhost'),
        'PORT': os.getenv('MYSQL_PORT', '3306'),
        'OPTIONS': {
            'charset': 'utf8mb4',
        },
    }
}

# -------------------------------------------------------------
# Validación de contraseñas
# -------------------------------------------------------------
AUTH_PASSWORD_VALIDATORS = [
    {
        'NAME': 'django.contrib.auth.password_validation.MinimumLengthValidator',
        'OPTIONS': {
            'min_length': 8,
        }
    },
]

# -------------------------------------------------------------
# Internacionalización
# -------------------------------------------------------------
LANGUAGE_CODE = 'en-us'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_TZ = True

# -------------------------------------------------------------
# Archivos estáticos y CORS
# -------------------------------------------------------------
STATIC_URL = 'static/'

FRONTEND_DIST = BASE_DIR.parent / 'frontend' / 'dist'
if FRONTEND_DIST.exists():
    STATICFILES_DIRS = [FRONTEND_DIST]

STATIC_ROOT = BASE_DIR / 'staticfiles'
CORS_ALLOW_ALL_ORIGINS = True  # Permite el acceso desde cualquier frontend.

# -------------------------------------------------------------
# Configuración de Django REST Framework y JWT
# -------------------------------------------------------------
REST_FRAMEWORK = {
    'DEFAULT_AUTHENTICATION_CLASSES': (
        'rest_framework_simplejwt.authentication.JWTAuthentication',
    ),
}

# Usuario personalizado para el sistema.
AUTH_USER_MODEL = 'usuarios.Usuario'
SIMPLE_JWT = {
    'USER_ID_FIELD': 'id_usuario',
}
