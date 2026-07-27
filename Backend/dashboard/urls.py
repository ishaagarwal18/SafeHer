from django.urls import path
from .views import *
from .api_views import (
    dashboard_data,
    api_contacts,
    api_add_trusted_contact,
    api_journeys,
    api_sos,
    api_reports,
)

urlpatterns = [
    path('', dashboard_page, name='dashboard'),
    path('sos/', sos_page, name='sos'),
    path('contacts/', contacts_page, name='contacts'),
    path('journey/', journey_page),
    path('places/', places_page),
    path('reports/', reports_page),
    path('history/', history_page),
    path('add_trusted_contact/', add_trusted_contact, name='add_trusted_contact'),
    path("dashboard-data/", dashboard_data, name="dashboard-api"),
    path("api/contacts/", api_contacts, name="api-contacts"),
    path("api/add-trusted-contact/", api_add_trusted_contact, name="api-add-trusted-contact"),
    path("api/journey/", api_journeys, name="api-journey"),
    path("api/sos/", api_sos, name="api-sos"),
    path("api/reports/", api_reports, name="api-reports"),
]