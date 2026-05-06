from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model
from usuarios.models import Rol

User = get_user_model()


class Command(BaseCommand):
    help = "Create a superuser with an admin role"

    def add_arguments(self, parser):
        parser.add_argument("--username", type=str, required=True, help="Username for the superuser")
        parser.add_argument("--email", type=str, required=True, help="Email for the superuser")
        parser.add_argument("--password", type=str, required=True, help="Password for the superuser")

    def handle(self, *args, **options):
        username = options["username"]
        email = options["email"]
        password = options["password"]

        # Crear o recuperar el rol ADMINISTRADOR_SISTEMA.
        rol_admin, created = Rol.objects.get_or_create(
            nombre_rol="ADMINISTRADOR_SISTEMA",
            defaults={"nombre_rol": "ADMINISTRADOR_SISTEMA"}
        )

        # Evita crear un usuario duplicado si el username ya existe.
        if User.objects.filter(username=username).exists():
            self.stdout.write(self.style.WARNING(f"El usuario {username} ya existe."))
            return

        # Crea el superusuario con el rol administrativo.
        user = User.objects.create_superuser(
            username=username,
            email=email,
            password=password,
            rol=rol_admin
        )

        self.stdout.write(
            self.style.SUCCESS(f"Superuser '{username}' creado exitosamente con rol ADMINISTRADOR_SISTEMA.")
        )
