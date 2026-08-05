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

<<<<<<< HEAD
def logout_view(request):
    request.session.flush()
    return redirect("/login/")

=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
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

        # Save Data Temporarily
        request.session["signup_name"] = name
        request.session["signup_email"] = email
        request.session["signup_phone"] = phone

        # Store HASHED password in session
        request.session["signup_password"] = make_password(password)

        # Generate OTP
        otp = str(random.randint(100000, 999999))

        # Save OTP
        obj, created = EmailOTP.objects.get_or_create(email=email)
        obj.otp = otp
        obj.is_verified = False
        obj.save()

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

<<<<<<< HEAD
    next_url = request.GET.get("next", "/dashboard/")

=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get("password")
<<<<<<< HEAD
        next_url = request.POST.get("next", "/dashboard/")
=======
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d

        try:

            user = UserProfile.objects.get(email=email)

            if check_password(password, user.password):

                request.session["user_id"] = user.id

<<<<<<< HEAD
                return redirect(next_url)
=======
                return redirect("/dashboard/")
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d

            else:

                return render(
                    request,
                    "login.html",
<<<<<<< HEAD
                    {"error": "Invalid Password", "next": next_url}
=======
                    {"error": "Invalid Password"}
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d
                )

        except UserProfile.DoesNotExist:

            return render(
                request,
                "login.html",
<<<<<<< HEAD
                {"error": "Email not found", "next": next_url}
            )

    return render(request, "login.html", {"next": next_url})
=======
                {"error": "Email not found"}
            )

    return render(request, "login.html")
>>>>>>> dceb0a1555706ab72984b56d01e3aa17a60ebe8d


def contacts_page(request):
    if request.method == "POST":
        EmergencyContact.objects.create(
            user=UserProfile.objects.first(),
            contact_name=request.POST["name"],
            phone_number=request.POST["phone"],
            relationship=request.POST["relationship"]
        )
    contacts = EmergencyContact.objects.all()
    return render(
        request,
        "contacts.html",
        {"contacts": contacts}
    )

def verify_email(request):
    if request.method == "POST":
        email = request.POST.get("email")
        otp = request.POST.get("otp")
        try:
            obj = EmailOTP.objects.get(email=email)

            # Check expiry
            if timezone.now() > obj.created_at + timedelta(minutes=OTP_EXPIRY_MINUTES):
                return render(request, "verify_email.html", {
                    "email": email,
                    "error": f"OTP expired. Please request a new one."
                })

            if obj.otp == otp:
                obj.is_verified = True
                obj.save()
                UserProfile.objects.create(
                    name=request.session["signup_name"],
                    email=request.session["signup_email"],
                    phone=request.session["signup_phone"],
                    password=request.session["signup_password"],
                )
                request.session.flush()
                return redirect("login")
            else:
                return render(request, "verify_email.html", {
                    "email": email,
                    "error": "Invalid OTP. Please try again."
                })
        except EmailOTP.DoesNotExist:
            return render(request, "verify_email.html", {
                "email": email,
                "error": "OTP not found. Please sign up again."
            })
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
