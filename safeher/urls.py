from django.contrib import admin
from django.urls import path, include

urlpatterns = [
    path(
        'admin/',
        admin.site.urls
    ),

    # authentication app
    path(
        '',
        include(
            'authentication.urls'
        )
    ),

    # dashboard app
    path(
        'dashboard/',
        include(
            'dashboard.urls'
        )
    ),
]