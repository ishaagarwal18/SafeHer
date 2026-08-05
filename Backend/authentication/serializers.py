from rest_framework import serializers
from .models import UserProfile, EmailOTP, EmergencyContact


class UserProfileSerializer(serializers.ModelSerializer):

    class Meta:
        model = UserProfile
        fields = "__all__"


class EmailOTPSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmailOTP
        fields = "__all__"


class EmergencyContactSerializer(serializers.ModelSerializer):

    class Meta:
        model = EmergencyContact
        fields = "__all__"