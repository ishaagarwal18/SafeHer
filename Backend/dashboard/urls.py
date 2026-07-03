from django.urls import path
from .views import *

urlpatterns = [

    path('', dashboard_page, name='dashboard'),
    path('sos/', sos_page, name='sos'),
    path('contacts/', contacts_page, name='contacts'),
    path('journey/', journey_page),
    path('places/', places_page),
    path('reports/', reports_page),
    path('history/', history_page),
    path('add_trusted_contact/', add_trusted_contact, name='add_trusted_contact'),
]