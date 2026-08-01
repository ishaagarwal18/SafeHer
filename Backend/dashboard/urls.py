from django.urls import path
from .views import *
from .api_views import (
    dashboard_data,
    contacts_api,
    mark_trusted_api,
    delete_contact_api,
    journey_api,
    sos_api,
    report_api,
)

urlpatterns = [
    # Template views
    path('', dashboard_page, name='dashboard'),
    path('sos/', sos_page, name='sos'),
    path('contacts/', contacts_page, name='contacts'),
    path('contacts/remove_trusted/', remove_trusted_contact, name='remove_trusted_contact'),
    path('contacts/delete/', delete_contact, name='delete_contact'),
    path('journey/', journey_page),
    path('places/', places_page),
    path('reports/', reports_page),
    path('history/', history_page),
    path('add_trusted_contact/', add_trusted_contact, name='add_trusted_contact'),

    # REST API endpoints
    path("dashboard-data/", dashboard_data, name="dashboard-api"),
    path("api/contacts/", contacts_api, name="contacts-api"),
    path("api/contacts/<int:contact_id>/trust/", mark_trusted_api, name="mark-trusted-api"),
    path("api/contacts/<int:contact_id>/delete/", delete_contact_api, name="delete-contact-api"),
    path("api/journey/", journey_api, name="journey-api"),
    path("api/sos/", sos_api, name="sos-api"),
    path("api/report/", report_api, name="report-api"),
]

