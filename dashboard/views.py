from authentication.models import EmergencyContact
from journey.models import Journey
from reports.models import UnsafeReport
from .models import SOSAlert
from django.shortcuts import render

def dashboard_page(request):
    context={"journey_count":Journey.objects.count(),
            "contact_count":EmergencyContact.objects.count(),
            "sos_count":SOSAlert.objects.count(),
            "report_count":UnsafeReport.objects.count(),}
    return render(request,"dashboard.html",context)

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
    return render(request,'contacts.html')

def journey_page(request):
    return render(request,'start_journey.html')

def places_page(request):
    return render(request,'safe_places.html')

def reports_page(request):
    return render(request,'report.html')

def history_page(request):
    return render(request,'journey_status.html')