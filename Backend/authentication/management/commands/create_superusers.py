import os
import json
from django.core.management.base import BaseCommand
from django.contrib.auth import get_user_model

User = get_user_model()

class Command(BaseCommand):
    help = "Creates multiple admin superuser accounts automatically from environment variables"

    def handle(self, *args, **options):
        # Method 1: SUPERUSERS environment variable formatted as:
        # username:email:password,username2:email2:password2,username3:email3:password3
        raw_superusers = os.getenv("SUPERUSERS", "")
        
        users_to_create = []

        if raw_superusers:
            for entry in raw_superusers.split(","):
                parts = entry.strip().split(":")
                if len(parts) >= 3:
                    users_to_create.append({
                        "username": parts[0].strip(),
                        "email": parts[1].strip(),
                        "password": parts[2].strip()
                    })

        # Method 2: Single superuser environment variables fallback
        single_user = os.getenv("DJANGO_SUPERUSER_USERNAME")
        single_email = os.getenv("DJANGO_SUPERUSER_EMAIL", "admin@safeher.com")
        single_pass = os.getenv("DJANGO_SUPERUSER_PASSWORD")

        if single_user and single_pass:
            users_to_create.append({
                "username": single_user.strip(),
                "email": single_email.strip(),
                "password": single_pass.strip()
            })

        if not users_to_create:
            self.stdout.write(self.style.WARNING("No superuser environment variables found (SUPERUSERS or DJANGO_SUPERUSER_USERNAME)."))
            return

        for u in users_to_create:
            username = u["username"]
            email = u["email"]
            password = u["password"]

            user, created = User.objects.get_or_create(
                username=username,
                defaults={
                    "email": email,
                    "is_staff": True,
                    "is_superuser": True
                }
            )

            if created:
                user.set_password(password)
                user.save()
                self.stdout.write(self.style.SUCCESS(f"Successfully created superuser '{username}'"))
            else:
                self.stdout.write(f"Superuser '{username}' already exists.")
