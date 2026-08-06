from django.db import models

# Create your models here.

class UnsafeReport(models.Model):
    user = models.ForeignKey(
        "authentication.UserProfile",
        on_delete=models.CASCADE,
        null=True,
        blank=True,
        related_name="unsafe_reports",
    )
    area_name = models.CharField(max_length=100)
    issue_type = models.CharField(max_length=100)
    description = models.TextField()
    created_at = models.DateTimeField(auto_now_add=True)
    def __str__(self):
        return self.area_name