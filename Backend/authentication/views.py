from django.shortcuts import render, redirect
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status
from .models import UserProfile
from .models import EmergencyContact, UserProfile
import random
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
from django.contrib.auth.hashers import make_password, check_password
from .serializers import UserProfileSerializer
from django.utils import timezone
from datetime import timedelta

OTP_EXPIRY_MINUTES = 10

def home(request):
    return render(request, 'index.html')

def logout_view(request):
    request.session.flush()
    return redirect("/login/")

def signup_page(request):
    return render(request, "signup.html")

def send_email_otp(request):

    if request.method == "POST":

        # Get Form Data
        name = request.POST.get("name")
        email = request.POST.get("email")
        phone = request.POST.get("phone")
        password = request.POST.get("password")
        confirm_password = request.POST.get("confirm_password")

        # Password Match
        if password != confirm_password:

            return render(request, "signup.html", {
                "error": "Passwords do not match!"
            })

        # Password Length
        if len(password) < 8:

            return render(request, "signup.html", {
                "error": "Password must contain at least 8 characters."
            })

        # Duplicate Email
        if UserProfile.objects.filter(email=email).exists():

            return render(request, "signup.html", {
                "error": "Email already registered."
            })

        # Duplicate Phone
        if UserProfile.objects.filter(phone=phone).exists():

            return render(request, "signup.html", {
                "error": "Phone number already registered."
            })

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Save OTP + signup data on the OTP record (session-independent fallback)
        obj, created = EmailOTP.objects.get_or_create(email=email)
        obj.otp = otp
        obj.is_verified = False
        obj.signup_name = name
        obj.signup_phone = phone
        obj.signup_password = make_password(password)
        obj.save()

        # Also keep in session as backup
        request.session["signup_name"] = name
        request.session["signup_email"] = email
        request.session["signup_phone"] = phone
        request.session["signup_password"] = obj.signup_password

        # Send Email
        try:
            send_mail(
                subject="SafeHer Email Verification",
                message=f"Hello {name},\n\nWelcome to SafeHer ❤️\n\nYour OTP is: {otp}\n\nValid for 5 minutes. Do not share it.\n\nTeam SafeHer",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print("EMAIL ERROR:", e)  # visible in Django dev server console
            return render(request, "signup.html", {
                "error": f"Failed to send OTP email. Please check your email address and try again."
            })

        return render(request, "verify_email.html", {"email": email})

    return redirect("signup")

def login_page(request):

    next_url = request.GET.get("next", "/dashboard/")

    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get("password")
        next_url = request.POST.get("next", "/dashboard/")

        try:

            user = UserProfile.objects.get(email=email)

            if check_password(password, user.password):

                request.session["user_id"] = user.id

                return redirect(next_url)

            else:

                return render(
                    request,
                    "login.html",
                    {"error": "Invalid Password", "next": next_url}
                )

        except UserProfile.DoesNotExist:

            return render(
                request,
                "login.html",
                {"error": "Email not found", "next": next_url}
            )

    return render(request, "login.html", {"next": next_url})


def contacts_page(request):
    user_id = request.session.get("user_id")
    user = UserProfile.objects.filter(id=user_id).first() if user_id else None
    if request.method == "POST" and user:
        EmergencyContact.objects.create(
            user=user,
            contact_name=request.POST["name"],
            phone_number=request.POST["phone"],
            relationship=request.POST["relationship"]
        )
    contacts = EmergencyContact.objects.filter(user=user) if user else EmergencyContact.objects.none()
    return render(
        request,
        "contacts.html",
        {"contacts": contacts}
    )


def verify_email(request):
    if request.method == "POST":
        email = request.POST.get("email", "").strip().lower()
        otp   = request.POST.get("otp", "").strip()

        try:
            obj = EmailOTP.objects.get(email=email)
        except EmailOTP.DoesNotExist:
            return render(request, "verify_email.html", {
                "email": email,
                "error": "OTP not found. Please sign up again."
            })

        # Check expiry
        if timezone.now() > obj.created_at + timedelta(minutes=OTP_EXPIRY_MINUTES):
            return render(request, "verify_email.html", {
                "email": email,
                "error": "OTP expired. Please request a new one."
            })

        if obj.otp != otp:
            return render(request, "verify_email.html", {
                "email": email,
                "error": "Invalid OTP. Please try again."
            })

        # Already verified / account exists
        if UserProfile.objects.filter(email=email).exists():
            return redirect("login")

        # Read signup data — prefer OTP record (cross-origin safe), fall back to session
        name     = obj.signup_name     or request.session.get("signup_name", "")
        phone    = obj.signup_phone    or request.session.get("signup_phone", "")
        hashed_pw = obj.signup_password or request.session.get("signup_password", "")

        # Validate we have everything needed
        if not name or not phone or not hashed_pw:
            return render(request, "verify_email.html", {
                "email": email,
                "error": "Session expired. Please sign up again."
            })

        # Truncate phone to 10 chars to match model max_length
        phone = phone[:10]

        # Handle duplicate phone — append suffix to avoid crash
        if UserProfile.objects.filter(phone=phone).exists():
            return render(request, "verify_email.html", {
                "email": email,
                "error": "Phone number already registered. Please sign up with a different number."
            })

        try:
            UserProfile.objects.create(
                name=name,
                email=email,
                phone=phone,
                password=hashed_pw,
            )
        except Exception as e:
            return render(request, "verify_email.html", {
                "email": email,
                "error": f"Account creation failed: {str(e)}"
            })

        # Mark OTP verified and clear signup data
        obj.is_verified   = True
        obj.signup_name   = None
        obj.signup_phone  = None
        obj.signup_password = None
        obj.save()

        request.session.flush()
        return redirect("login")

    return redirect("signup")


def resend_otp(request):
    if request.method == "POST":
        email = request.POST.get("email") or request.session.get("signup_email")
        name = request.session.get("signup_name", "User")
        if not email:
            return redirect("signup")

        otp = str(random.randint(100000, 999999))
        obj, _ = EmailOTP.objects.get_or_create(email=email)
        obj.otp = otp
        obj.is_verified = False
        obj.save()  # auto_now=True resets created_at

        try:
            send_mail(
                subject="SafeHer — New OTP",
                message=f"Hello {name},\n\nYour new OTP is: {otp}\n\nValid for {OTP_EXPIRY_MINUTES} minutes. Do not share it.\n\nTeam SafeHer",
                from_email=settings.EMAIL_HOST_USER,
                recipient_list=[email],
                fail_silently=False,
            )
        except Exception as e:
            print("RESEND OTP EMAIL ERROR:", e)

        return render(request, "verify_email.html", {
            "email": email,
            "success": "A new OTP has been sent to your email."
        })
    return redirect("signup")


@api_view(["POST"])

def signup_api(request):

    serializer = UserProfileSerializer(
        data=request.data
    )

    if serializer.is_valid():

        serializer.save()

        return Response(

            {

                "message":"Signup Successful"

            },

            status=status.HTTP_201_CREATED

        )

    return Response(

        serializer.errors,

        status=status.HTTP_400_BAD_REQUEST

    )
    return redirect("signup")
