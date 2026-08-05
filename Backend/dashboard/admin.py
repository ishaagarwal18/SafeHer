from django.contrib import admin
from .models import (
    SOSAlert,
    SOSSession,
    SOSLocation,
    SOSPhoto,
    SOSAudio,
    SOSVideo,
)

@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ("id", "alert_time", "status", "latitude", "longitude", "location")
    list_filter = ("status", "alert_time")

@admin.register(SOSSession)
class SOSSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "start_time", "end_time", "duration_seconds")
    list_filter = ("status", "start_time")
    search_fields = ("user__name", "user__email")

@admin.register(SOSLocation)
class SOSLocationAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "latitude", "longitude", "timestamp")
    list_filter = ("timestamp",)

@admin.register(SOSPhoto)
class SOSPhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "captured_at")

@admin.register(SOSAudio)
class SOSAudioAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "duration_seconds", "recorded_at")

@admin.register(SOSVideo)
class SOSVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "duration_seconds", "recorded_at")