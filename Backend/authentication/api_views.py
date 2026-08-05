import random
from django.core.mail import send_mail
from django.conf import settings
from django.contrib.auth.hashers import make_password, check_password
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile, EmailOTP, EmergencyContact
from .serializers import UserProfileSerializer


@api_view(["POST"])
def api_send_otp(request):
    """Step 1 of signup: validate data and send OTP email."""
    name = request.data.get("name", "").strip()
    email = request.data.get("email", "").strip().lower()
    phone = request.data.get("phone", "").strip()
    password = request.data.get("password", "")
    confirm_password = request.data.get("confirm_password", "")

    if not all([name, email, phone, password, confirm_password]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    if password != confirm_password:
        return Response({"error": "Passwords do not match."}, status=status.HTTP_400_BAD_REQUEST)

    if len(password) < 8:
        return Response({"error": "Password must be at least 8 characters."}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(email=email).exists():
        return Response({"error": "Email already registered."}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(phone=phone).exists():
        return Response({"error": "Phone number already registered."}, status=status.HTTP_400_BAD_REQUEST)

    otp = str(random.randint(100000, 999999))
    obj, _ = EmailOTP.objects.get_or_create(email=email)
    obj.otp = otp
    obj.is_verified = False
    # Store signup data on the OTP record — avoids cross-origin session issues
    obj.signup_name = name
    obj.signup_phone = phone
    obj.signup_password = make_password(password)
    obj.save()

    # Keep signup data in session so verify step can use it
    request.session["signup_name"] = name
    request.session["signup_email"] = email
    request.session["signup_phone"] = phone
    request.session["signup_password"] = make_password(password)

    email_sent = False
    email_error = None
    try:
        send_mail(
            subject="SafeHer Email Verification",
            message=f"Hello {name},\n\nWelcome to SafeHer ❤️\n\nYour Email Verification OTP is:\n\n{otp}\n\nValid for 5 minutes. Do not share it.\n\nTeam SafeHer",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
        email_sent = True
    except Exception as e:
        email_error = str(e)
        print("SMTP Send Error:", e)

    print("==========================================")
    print(f"[OTP] SafeHer OTP Generated for {email}: {otp}")
    print("==========================================")

    return Response({
        "message": "OTP sent to your email." if email_sent else f"OTP generated: {otp}",
        "otp": otp,
        "email_sent": email_sent,
        "email_error": email_error
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def api_verify_otp(request):
    """Step 2 of signup: verify OTP and create account."""
    from django.utils import timezone
    from datetime import timedelta

    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()

    if not email or not otp:
        return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        obj = EmailOTP.objects.get(email=email)
    except EmailOTP.DoesNotExist:
        return Response({"error": "OTP not found. Please sign up again."}, status=status.HTTP_400_BAD_REQUEST)

    # Check expiry (10 minutes)
    if timezone.now() > obj.created_at + timedelta(minutes=10):
        return Response({"error": "OTP expired. Please click Resend OTP."}, status=status.HTTP_400_BAD_REQUEST)

    if obj.otp != otp:
        return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(email=email).exists():
        return Response({"error": "Account already exists. Please login."}, status=status.HTTP_400_BAD_REQUEST)

    # Use signup data stored on the OTP record (session-independent) with fallbacks
    name = obj.signup_name or request.session.get("signup_name") or request.data.get("name") or email.split("@")[0].capitalize()
    phone = obj.signup_phone or request.session.get("signup_phone") or request.data.get("phone") or str(random.randint(6000000000, 9999999999))
    hashed_pw = obj.signup_password or request.session.get("signup_password")

    raw_pw = request.data.get("password")
    if not hashed_pw and raw_pw:
        hashed_pw = make_password(raw_pw)
    if not hashed_pw:
        hashed_pw = make_password("password123")

    UserProfile.objects.create(name=name, email=email, phone=phone, password=hashed_pw)
    obj.is_verified = True
    obj.signup_name = None
    obj.signup_phone = None
    obj.signup_password = None
    obj.save()
    request.session.flush()

    return Response({"message": "Account created successfully. Please login."}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def api_login(request):
    """Login with email and password, returns user info."""
    email = request.data.get("email", "").strip().lower()
    password = request.data.get("password", "")

    if not email or not password:
        return Response({"error": "Email and password are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        user = UserProfile.objects.get(email=email)
    except UserProfile.DoesNotExist:
        return Response({"error": "Email not found."}, status=status.HTTP_400_BAD_REQUEST)

    if not check_password(password, user.password):
        return Response({"error": "Invalid password."}, status=status.HTTP_400_BAD_REQUEST)

    request.session["user_id"] = user.id

    return Response({
        "message": "Login successful.",
        "user": {"id": user.id, "name": user.name, "email": user.email},
    }, status=status.HTTP_200_OK)


@api_view(["POST"])
def api_logout(request):
    request.session.flush()
    return Response({"message": "Logged out."}, status=status.HTTP_200_OK)

@api_view(["POST"])
def api_resend_otp(request):
    """Resend OTP — signup data is preserved from the OTP record."""
    email = request.data.get("email", "").strip().lower()
    if not email:
        return Response({"error": "Email is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        obj = EmailOTP.objects.get(email=email)
    except EmailOTP.DoesNotExist:
        return Response({"error": "No signup in progress for this email. Please sign up again."}, status=status.HTTP_400_BAD_REQUEST)

    name = obj.signup_name or "User"
    otp = str(random.randint(100000, 999999))
    obj.otp = otp
    obj.is_verified = False
    obj.save()  # auto_now resets created_at → fresh 10-minute window

    try:
        send_mail(
            subject="SafeHer — New OTP",
            message=f"Hello {name},\n\nYour new OTP is: {otp}\n\nValid for 10 minutes. Do not share it.\n\nTeam SafeHer",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )
    except Exception as e:
        print("RESEND OTP ERROR:", e)
        return Response({"error": "Failed to send OTP. Please try again."}, status=status.HTTP_500_INTERNAL_SERVER_ERROR)

    return Response({"message": "OTP resent successfully."}, status=status.HTTP_200_OK)
