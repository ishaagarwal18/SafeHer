from django.db import models
from django.contrib.auth.hashers import make_password
import random

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=225)
    phone = models.CharField(max_length=10, unique=True)

    def save(self, *args, **kwargs):
        if self.password and not self.password.startswith("pbkdf2_sha256$") and not self.password.startswith("argon2"):
            self.password = make_password(self.password)
        super().save(*args, **kwargs)

    def __str__(self):
        return self.name
    
class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now=True)
    is_verified = models.BooleanField(default=False)
    # Signup data stored here so we don't rely on cross-origin sessions
    signup_name = models.CharField(max_length=100, blank=True, null=True)
    signup_phone = models.CharField(max_length=15, blank=True, null=True)
    signup_password = models.CharField(max_length=255, blank=True, null=True)
    def generate_otp(self):
        self.otp = str(random.randint(100000,999999))
        self.save()
    def __str__(self):
        return self.email

class EmergencyContact(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE, null=True, blank=True)
    contact_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    email = models.EmailField(blank=True, null=True)
    relationship = models.CharField(max_length=50)
    is_trusted = models.BooleanField(default=False)
    def __str__(self):
        return self.contact_name