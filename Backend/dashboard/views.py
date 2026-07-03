from django.shortcuts import render, redirect,get_object_or_404
from .models import SOSAlert
from Backend.journey.models import Journey
from Backend.authentication.models import EmergencyContact, UserProfile
from Backend.reports.models import UnsafeReport
from urllib.parse import quote



def add_trusted_contact(request):
    if request.method == "POST":
        contact_id = request.POST.get("contact_id")
        contact = get_object_or_404(EmergencyContact, id=contact_id)
        contact.is_trusted = True
        contact.save()

    return redirect("/dashboard/")

def dashboard_page(request):
    journey_count = Journey.objects.count()
    contact_count = EmergencyContact.objects.count()
    sos_count = SOSAlert.objects.count()
    trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    context = {
    "journey_count": journey_count,
    "contact_count": contact_count,
    "sos_count": sos_count,
    "contact": trusted_contacts,
    }

    return render(request, "dashboard.html", context)

def sos_page(request):
    if request.method=="POST":

        location=request.POST.get("location")
        latitude=request.POST.get("latitude")
        longitude=request.POST.get("longitude")

        SOSAlert.objects.create(

            status="Sent",
            location=location,
            latitude=latitude,
            longitude=longitude

        )

    alerts=SOSAlert.objects.all().order_by("-id")

    return render(request,"sos.html",{"alerts":alerts})

def contacts_page(request):
    if request.method == "POST":
        print("POST request received")
        print(request.POST)

        EmergencyContact.objects.create(
            user=UserProfile.objects.first(),
            contact_name=request.POST.get("name", ""),
            phone_number=request.POST.get("phone", ""),
            relationship=request.POST.get("relationship", "")
        )

    contacts = EmergencyContact.objects.all()
    return render(request, "contacts.html", {"contacts": contacts})


def journey_page(request):
    if request.method == "POST":
        source = request.POST.get("source")
        destination = request.POST.get("destination")
        transport = request.POST.get("transport")

        Journey.objects.create(
            source=source,
            destination=destination,
            transport_mode=transport
        )

        return redirect("/dashboard/journey/")

    journeys = Journey.objects.all()

    return render(request, "start_journey.html", {"journeys": journeys})

def places_page(request):
    return render(request,'safe_places.html')

def reports_page(request):
    if request.method == "POST":
        UnsafeReport.objects.create(
            area_name=request.POST.get("area", ""),
            issue_type=request.POST.get("issue", ""),
            description=request.POST.get("description", "")
        )
    reports = UnsafeReport.objects.all().order_by("-id")
    return render(request, 'report.html', {"reports": reports})

def history_page(request):
    return render(request,'journey_status.html')