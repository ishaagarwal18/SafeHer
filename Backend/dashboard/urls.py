from django.urls import path
from .views import (
    dashboard_page,
    sos_page,
    contacts_page,
    journey_page,
    places_page,
    reports_page,
    history_page,
    add_trusted_contact,
)
from .api_views import (
    dashboard_data,
    api_contacts,
    contacts_api,
    api_add_trusted_contact,
    mark_trusted_api,
    api_journeys,
    journey_api,
    api_sos,
    sos_api,
    api_reports,
    report_api,
)

urlpatterns = [
    # Template views
    path('', dashboard_page, name='dashboard'),
    path('sos/', sos_page, name='sos'),
    path('contacts/', contacts_page, name='contacts'),
    path('journey/', journey_page, name='journey'),
    path('places/', places_page, name='places'),
    path('reports/', reports_page, name='reports'),
    path('history/', history_page, name='history'),
    path('add_trusted_contact/', add_trusted_contact, name='add_trusted_contact'),

    # REST API endpoints
    path("dashboard-data/", dashboard_data, name="dashboard-api"),
    path("api/contacts/", api_contacts, name="contacts-api"),
    path("api/add-trusted-contact/", api_add_trusted_contact, name="api-add-trusted-contact"),
    path("api/contacts/<int:contact_id>/trust/", mark_trusted_api, name="mark-trusted-api"),
    path("api/journey/", api_journeys, name="journey-api"),
    path("api/sos/", api_sos, name="sos-api"),
    path("api/reports/", api_reports, name="reports-api"),
    path("api/report/", report_api, name="report-api"),
]
