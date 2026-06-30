from django.db import models
import random

class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=225)
    phone = models.CharField(max_length=10, unique=True)
    def __str__(self):
        return self.name
    
class EmailOTP(models.Model):
    email = models.EmailField(unique=True)
    otp = models.CharField(max_length=6)
    created_at = models.DateTimeField(auto_now_add=True)
    is_verified = models.BooleanField(default=False)
    def generate_otp(self):
        self.otp = str(random.randint(100000,999999))
        self.save()
    def __str__(self):
        return self.email

class EmergencyContact(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.CASCADE)
    contact_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    relationship = models.CharField(max_length=50)
    is_trusted = models.BooleanField(default=False)
    def __str__(self):
        return self.contact_name