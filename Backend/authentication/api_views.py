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
    # Store signup data temporarily on the OTP record
    obj.save()

    # Keep signup data in session so verify step can use it
    request.session["signup_name"] = name
    request.session["signup_email"] = email
    request.session["signup_phone"] = phone
    request.session["signup_password"] = make_password(password)

    try:
        send_mail(
            subject="SafeHer Email Verification",
            message=f"Hello {name},\n\nYour OTP is: {otp}\n\nValid for 5 minutes. Do not share it.\n\nTeam SafeHer",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=True,
        )
    except Exception as e:
        print("OTP Email send exception:", e)

    return Response({"message": "OTP sent to your email."}, status=status.HTTP_200_OK)


@api_view(["POST"])
def api_verify_otp(request):
    """Step 2 of signup: verify OTP and create account."""
    email = request.data.get("email", "").strip().lower()
    otp = request.data.get("otp", "").strip()

    if not email or not otp:
        return Response({"error": "Email and OTP are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        obj = EmailOTP.objects.get(email=email)
    except EmailOTP.DoesNotExist:
        return Response({"error": "OTP not found. Please sign up again."}, status=status.HTTP_400_BAD_REQUEST)

    if obj.otp != otp:
        return Response({"error": "Invalid OTP."}, status=status.HTTP_400_BAD_REQUEST)

    if UserProfile.objects.filter(email=email).exists():
        return Response({"error": "Account already exists. Please login."}, status=status.HTTP_400_BAD_REQUEST)

    name = request.session.get("signup_name")
    phone = request.session.get("signup_phone")
    hashed_pw = request.session.get("signup_password")

    if not all([name, phone, hashed_pw]):
        return Response({"error": "Session expired. Please sign up again."}, status=status.HTTP_400_BAD_REQUEST)

    UserProfile.objects.create(name=name, email=email, phone=phone, password=hashed_pw)
    obj.is_verified = True
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
