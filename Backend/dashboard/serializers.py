from rest_framework import serializers
from .models import SOSSession, SOSLocation, SOSPhoto, SOSAudio, SOSVideo


class SOSLocationSerializer(serializers.ModelSerializer):
    class Meta:
        model = SOSLocation
        fields = ["id", "latitude", "longitude", "accuracy", "location_name", "timestamp"]


class SOSPhotoSerializer(serializers.ModelSerializer):
    image_url = serializers.SerializerMethodField()

    class Meta:
        model = SOSPhoto
        fields = ["id", "image", "image_url", "captured_at"]

    def get_image_url(self, obj):
        if obj.image:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.image.url)
            return obj.image.url
        return None


class SOSAudioSerializer(serializers.ModelSerializer):
    audio_url = serializers.SerializerMethodField()

    class Meta:
        model = SOSAudio
        fields = ["id", "audio_file", "audio_url", "duration_seconds", "recorded_at"]

    def get_audio_url(self, obj):
        if obj.audio_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.audio_file.url)
            return obj.audio_file.url
        return None


class SOSVideoSerializer(serializers.ModelSerializer):
    video_url = serializers.SerializerMethodField()

    class Meta:
        model = SOSVideo
        fields = ["id", "video_file", "video_url", "duration_seconds", "recorded_at"]

    def get_video_url(self, obj):
        if obj.video_file:
            request = self.context.get("request")
            if request:
                return request.build_absolute_uri(obj.video_file.url)
            return obj.video_file.url
        return None


class SOSSessionSerializer(serializers.ModelSerializer):
    location_updates = SOSLocationSerializer(many=True, read_only=True)
    photos = SOSPhotoSerializer(many=True, read_only=True)
    audios = SOSAudioSerializer(many=True, read_only=True)
    videos = SOSVideoSerializer(many=True, read_only=True)
    user_name = serializers.SerializerMethodField()

    class Meta:
        model = SOSSession
        fields = [
            "id",
            "user",
            "user_name",
            "start_time",
            "end_time",
            "duration_seconds",
            "status",
            "initial_latitude",
            "initial_longitude",
            "initial_location",
            "last_known_location",
            "location_updates",
            "photos",
            "audios",
            "videos",
            "created_at",
            "updated_at",
        ]

    def get_user_name(self, obj):
        return obj.user.name if obj.user else "User"
