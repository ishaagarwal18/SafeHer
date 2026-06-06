from django.db import models

# Create your models here.

class SOSAlert(models.Model):
    alert_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20,default="Triggered")
    location = models.CharField(max_length=255,blank=True)
    def __str__(self):
        return self.status