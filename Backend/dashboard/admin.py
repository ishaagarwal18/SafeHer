from django.contrib import admin
from .models import SOSAlert, SOSSession, SOSLocation, SOSPhoto, SOSAudio, SOSVideo


@admin.register(SOSAlert)
class SOSAlertAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "location", "alert_time")
    list_filter = ("status", "alert_time")
    search_fields = ("user__name", "user__email", "location")


class SOSLocationInline(admin.TabularInline):
    model = SOSLocation
    extra = 0
    readonly_fields = ("latitude", "longitude", "accuracy", "location_name", "timestamp")


class SOSPhotoInline(admin.TabularInline):
    model = SOSPhoto
    extra = 0
    readonly_fields = ("image", "captured_at")


class SOSAudioInline(admin.TabularInline):
    model = SOSAudio
    extra = 0
    readonly_fields = ("audio_file", "duration_seconds", "recorded_at")


class SOSVideoInline(admin.TabularInline):
    model = SOSVideo
    extra = 0
    readonly_fields = ("video_file", "duration_seconds", "recorded_at")


@admin.register(SOSSession)
class SOSSessionAdmin(admin.ModelAdmin):
    list_display = ("id", "user", "status", "start_time", "end_time", "duration_seconds", "last_known_location")
    list_filter = ("status", "start_time")
    search_fields = ("user__name", "user__email", "initial_location", "last_known_location")
    inlines = [SOSLocationInline, SOSPhotoInline, SOSAudioInline, SOSVideoInline]


@admin.register(SOSLocation)
class SOSLocationAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "latitude", "longitude", "accuracy", "location_name", "timestamp")
    list_filter = ("timestamp",)
    search_fields = ("session__user__name", "location_name")


@admin.register(SOSPhoto)
class SOSPhotoAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "image", "captured_at")
    list_filter = ("captured_at",)
    search_fields = ("session__user__name",)


@admin.register(SOSAudio)
class SOSAudioAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "audio_file", "duration_seconds", "recorded_at")
    list_filter = ("recorded_at",)
    search_fields = ("session__user__name",)


@admin.register(SOSVideo)
class SOSVideoAdmin(admin.ModelAdmin):
    list_display = ("id", "session", "video_file", "duration_seconds", "recorded_at")
    list_filter = ("recorded_at",)
    search_fields = ("session__user__name",)