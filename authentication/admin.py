from django.contrib import admin
from .models import UserProfile, EmergencyContact

admin.site.register(UserProfile)
admin.site.register(EmergencyContact)