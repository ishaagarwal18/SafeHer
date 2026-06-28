from django.shortcuts import render, redirect
from .models import UserProfile
from .models import EmergencyContact, UserProfile
import random
from django.core.mail import send_mail
from django.conf import settings
from .models import EmailOTP
from django.contrib.auth.hashers import make_password, check_password

def home(request):
    return render(request, 'index.html')

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
        send_mail(
            subject="SafeHer Email Verification",
            message=f"""
Hello {name},

Welcome to SafeHer ❤️

Your Email Verification OTP is:

{otp}

This OTP is valid for 5 minutes.

Do not share it with anyone.

Team SafeHer
""",
            from_email=settings.EMAIL_HOST_USER,
            recipient_list=[email],
            fail_silently=False,
        )

        return render(
            request,
            "verify_email.html",
            {
                "email": email
            }
        )

    return redirect("signup")

def login_page(request):

    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get("password")

        try:

            user = UserProfile.objects.get(email=email)

            if check_password(password, user.password):

                request.session["user_id"] = user.id

                return redirect("/dashboard/")

            else:

                return render(
                    request,
                    "login.html",
                    {"error": "Invalid Password"}
                )

        except UserProfile.DoesNotExist:

            return render(
                request,
                "login.html",
                {"error": "Email not found"}
            )

    return render(request, "login.html")


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
                return render(
                    request,
                    "verify_email.html",
                    {
                        "email": email,
                        "error": "Invalid OTP"
                    }
                )
        except EmailOTP.DoesNotExist:
            return render(
                request,
                "verify_email.html",
                {
                    "email": email,
                    "error": "OTP not found"
                }
            )
    return redirect("signup")