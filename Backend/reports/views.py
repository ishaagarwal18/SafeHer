from django.shortcuts import render
from .models import UnsafeReport

def report_page(request):

    if request.method == "POST":

        UnsafeReport.objects.create(
            area_name=request.POST["area"],
            issue_type=request.POST["issue"],
            description=request.POST["description"]
        )

    reports = UnsafeReport.objects.all()

    return render(
        request,
        "report.html",
        {"reports": reports}
    )