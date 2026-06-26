# from django.shortcuts import render
# from .models import SOSAlert


# def dashboard_page(request):
#     return render(request,'dashboard.html')

# def sos_page(request):

#     if request.method == "POST":

#         SOSAlert.objects.create(
#             location="Ahmedabad"
#         )

#     alerts = SOSAlert.objects.all()

#     return render(
#         request,
#         "sos.html",
#         {"alerts": alerts}
#     )

# def contacts_page(request):
#     return render(request,'contacts.html')

# def journey_page(request):
#     return render(request,'start_journey.html')

# def places_page(request):
#     return render(request,'safe_places.html')

# def reports_page(request):
#     return render(request,'report.html')

# def history_page(request):
#     return render(request,'journey_status.html')


from django.shortcuts import render
from .models import SOSAlert


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
    return render(request,'contacts.html')

def journey_page(request):
    return render(request,'start_journey.html')

def places_page(request):
    return render(request,'safe_places.html')

def reports_page(request):
    return render(request,'report.html')

def history_page(request):
    return render(request,'journey_status.html')