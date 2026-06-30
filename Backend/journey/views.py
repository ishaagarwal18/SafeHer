from django.shortcuts import render
from .models import Journey

def journey_page(request):

    if request.method == "POST":

        Journey.objects.create(
            source=request.POST["source"],
            destination=request.POST["destination"],
            transport_mode=request.POST["transport"]
        )

    journeys = Journey.objects.all()

    return render(
        request,
        "start_journey.html",
        {"journeys": journeys}
    )