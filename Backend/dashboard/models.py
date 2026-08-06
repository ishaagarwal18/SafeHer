from django.db import models
from authentication.models import UserProfile


class SOSAlert(models.Model):
    user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="sos_alerts")
    alert_time = models.DateTimeField(auto_now_add=True)
    status = models.CharField(max_length=50)
    latitude = models.CharField(max_length=50, blank=True, null=True)
    longitude = models.CharField(max_length=50, blank=True, null=True)
    location = models.TextField(blank=True, null=True)

    def __str__(self):
        user_str = f" ({self.user.name})" if self.user else ""
        return f"SOS Alert at {self.alert_time}{user_str} ({self.status})"



class SOSSession(models.Model):
    STATUS_CHOICES = [
        ("Active", "Active"),
        ("Resolved", "Resolved"),
        ("Cancelled", "Cancelled"),
    ]

    user = models.ForeignKey(UserProfile, on_delete=models.SET_NULL, null=True, blank=True, related_name="sos_sessions")
    start_time = models.DateTimeField(auto_now_add=True)
    end_time = models.DateTimeField(null=True, blank=True)
    duration_seconds = models.IntegerField(default=0)
    status = models.CharField(max_length=20, choices=STATUS_CHOICES, default="Active")
    initial_latitude = models.CharField(max_length=50, blank=True, null=True)
    initial_longitude = models.CharField(max_length=50, blank=True, null=True)
    initial_location = models.TextField(blank=True, null=True)
    last_known_location = models.TextField(blank=True, null=True)
    created_at = models.DateTimeField(auto_now_add=True)
    updated_at = models.DateTimeField(auto_now=True)

    class Meta:
        ordering = ["-start_time"]

    def __str__(self):
        user_info = self.user.name if self.user else "Anonymous"
        return f"SOSSession #{self.id} - {user_info} ({self.status})"


class SOSLocation(models.Model):
    session = models.ForeignKey(SOSSession, on_delete=models.CASCADE, related_name="location_updates")
    latitude = models.CharField(max_length=50)
    longitude = models.CharField(max_length=50)
    accuracy = models.FloatField(null=True, blank=True)
    location_name = models.TextField(blank=True, null=True)
    timestamp = models.DateTimeField(auto_now_add=True)

    class Meta:
        ordering = ["timestamp"]

    def __str__(self):
        return f"Location update for Session #{self.session_id} at {self.timestamp}"


class SOSPhoto(models.Model):
    session = models.ForeignKey(SOSSession, on_delete=models.CASCADE, related_name="photos")
    image = models.ImageField(upload_to="sos/photos/")
    captured_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Photo #{self.id} for Session #{self.session_id}"


class SOSAudio(models.Model):
    session = models.ForeignKey(SOSSession, on_delete=models.CASCADE, related_name="audios")
    audio_file = models.FileField(upload_to="sos/audio/")
    duration_seconds = models.IntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Audio #{self.id} for Session #{self.session_id}"


class SOSVideo(models.Model):
    session = models.ForeignKey(SOSSession, on_delete=models.CASCADE, related_name="videos")
    video_file = models.FileField(upload_to="sos/video/")
    duration_seconds = models.IntegerField(default=0)
    recorded_at = models.DateTimeField(auto_now_add=True)

    def __str__(self):
        return f"Video #{self.id} for Session #{self.session_id}"