from django.db import models

# Create your models here.

class SOSAlert(models.Model):
    alert_time=models.DateTimeField(auto_now_add=True)
    status=models.CharField(max_length=50)
    latitude = models.CharField(max_length=50, blank=True, null=True)
    longitude = models.CharField(max_length=50, blank=True, null=True)
    location = models.TextField(blank=True, null=True)