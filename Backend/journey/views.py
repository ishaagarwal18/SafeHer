from django.shortcuts import render
from .models import Journey

def journey_page(request):
<<<<<<< HEAD
    if request.method == "POST":
=======

    if request.method == "POST":

>>>>>>> 638ded2b3cfbe47f6a9e7fe38770d4a478977c07
        Journey.objects.create(
            source=request.POST["source"],
            destination=request.POST["destination"],
            transport_mode=request.POST["transport"]
        )
<<<<<<< HEAD
    journeys = Journey.objects.all()
    return render(request,"start_journey.html",{"journeys": journeys})
=======

    journeys = Journey.objects.all()

    return render(
        request,
        "start_journey.html",
        {"journeys": journeys}
    )
>>>>>>> 638ded2b3cfbe47f6a9e7fe38770d4a478977c07
