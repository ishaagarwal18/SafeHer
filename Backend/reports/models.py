from django.db import models

# Create your models here.

class UnsafeReport(models.Model):
    area_name = models.CharField(max_length=100)
    issue_type = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.area_name