from django.shortcuts import render, redirect
from .models import UserProfile
from .models import EmergencyContact, UserProfile

def home(request):
    return render(request, 'index.html')


def signup_page(request):

    if request.method == "POST":

        name = request.POST.get("name")
        email = request.POST.get("email")
        password = request.POST.get("password")
        emergency_contact = request.POST.get(
            "emergency_contact"
        )

        # duplicate email check
        if UserProfile.objects.filter(
            email=email
        ).exists():

            return render(
                request,
                "signup.html",
                {
                    "error":
                    "Email already exists"
                }
            )

        UserProfile.objects.create(
            name=name,
            email=email,
            password=password,
            emergency_contact=
            emergency_contact
        )

        return redirect("/login/")

    return render(request, "signup.html")


def login_page(request):

    if request.method == "POST":

        email = request.POST.get("email")
        password = request.POST.get(
            "password"
        )

        user = UserProfile.objects.filter(
            email=email,
            password=password
        ).first()

        if user:
            return redirect("/dashboard/")

        return render(
            request,
            "login.html",
            {
                "error":
                "Invalid email or password"
            }
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