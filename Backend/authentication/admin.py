from django.contrib import admin
from .models import UserProfile, EmergencyContact, EmailOTP

@admin.register(UserProfile)
class UserProfileAdmin(admin.ModelAdmin):
    list_display = ("id", "name", "email", "phone")
    search_fields = ("name", "email", "phone")


@admin.register(EmergencyContact)
class EmergencyContactAdmin(admin.ModelAdmin):
    list_display = ("id", "contact_name", "phone_number", "email", "relationship", "is_trusted", "user")
    list_filter = ("is_trusted", "relationship")
    search_fields = ("contact_name", "phone_number", "email")
    list_editable = ("is_trusted",)


class TrustedContactProxy(EmergencyContact):
    class Meta:
        proxy = True
        verbose_name = "Trusted Contact"
        verbose_name_plural = "Trusted Contacts"


@admin.register(TrustedContactProxy)
class TrustedContactAdmin(admin.ModelAdmin):
    list_display = ("id", "contact_name", "phone_number", "email", "relationship", "user")
    search_fields = ("contact_name", "phone_number", "email")

    def get_queryset(self, request):
        return super().get_queryset(request).filter(is_trusted=True)


@admin.register(EmailOTP)
class EmailOTPAdmin(admin.ModelAdmin):
    list_display = ("email", "otp", "created_at", "is_verified")
    list_filter = ("is_verified",)
    search_fields = ("email",)
