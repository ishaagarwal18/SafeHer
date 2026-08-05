from django.db import models
from django.conf import settings

class Journey(models.Model):
    user = models.ForeignKey(
        "authentication.UserProfile",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        related_name="journeys",
    )
    source = models.CharField(max_length=100)
    destination = models.CharField(max_length=100)
    transport_mode = models.CharField(max_length=50)
    start_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=20, default="Active")
    expected_duration_minutes = models.PositiveIntegerField(null=True, blank=True)
    estimated_arrival_at = models.DateTimeField(null=True, blank=True)
    completed_at = models.DateTimeField(null=True, blank=True)
    next_safety_check_at = models.DateTimeField(null=True, blank=True)
    last_safety_check_at = models.DateTimeField(null=True, blank=True)
    safety_check_count = models.PositiveSmallIntegerField(default=0)
    missed_check_count = models.PositiveSmallIntegerField(default=0)
    safety_check_pending = models.BooleanField(default=False)
    escalated_at = models.DateTimeField(null=True, blank=True)

    def __str__(self):
        return f"{self.source} -> {self.destination}"
