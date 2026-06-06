from django.db import models

# Create your models here.

class Journey(models.Model):
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    transport_mode = models.CharField(max_length=50)
    start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20,default="Active")
    def __str__(self):
        return f"{self.source} -> {self.destination}"