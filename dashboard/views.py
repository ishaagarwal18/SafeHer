from django.shortcuts import render, redirect
from .models import SOSAlert
from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from reports.models import UnsafeReport
from urllib.parse import quote


def dashboard_page(request):
    return render(request,'dashboard.html')

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
        EmergencyContact.objects.create(
            user=UserProfile.objects.first(),
            contact_name=request.POST.get("name", ""),
            phone_number=request.POST.get("phone", ""),
            relationship=request.POST.get("relationship", "")
        )
    contacts = EmergencyContact.objects.all()
    return render(request, 'contacts.html', {"contacts": contacts})

def journey_page(request):
    return render(request,'start_journey.html')

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