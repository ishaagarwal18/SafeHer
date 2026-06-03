from django.shortcuts import render


def dashboard_page(request):
    return render(
        request,
        'dashboard.html'
    )


def sos_page(request):
    return render(
        request,
        'sos.html'
    )


def contacts_page(request):
    return render(
        request,
        'contacts.html'
    )