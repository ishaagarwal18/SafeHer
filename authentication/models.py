from django.db import models


class UserProfile(models.Model):

    name = models.CharField(
        max_length=100
    )

    email = models.EmailField(
        unique=True
    )

    password = models.CharField(
        max_length=100
    )

    emergency_contact = models.CharField(
        max_length=15
    )

    def __str__(self):
        return self.name