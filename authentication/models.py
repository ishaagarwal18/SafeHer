from django.db import models


class UserProfile(models.Model):
    name = models.CharField(max_length=100)
    email = models.EmailField(unique=True)
    password = models.CharField(max_length=100)
    emergency_contact = models.CharField(max_length=15)
    def __str__(self):
        return self.name

class EmergencyContact(models.Model):
    user = models.ForeignKey(UserProfile,on_delete=models.CASCADE)
    contact_name = models.CharField(max_length=100)
    phone_number = models.CharField(max_length=15)
    relationship = models.CharField(max_length=50)
    def __str__(self):
        return self.contact_name