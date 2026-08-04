from django.urls import path
from .views import (
    dashboard_page,
    sos_page,
    contacts_page,
    remove_trusted_contact,
    delete_contact,
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
    delete_contact_api,
    api_journeys,
    journey_api,
    api_sos,
    sos_api,
    api_reports,
    report_api,
    sos_start_api,
    sos_location_api,
    sos_end_api,
    sos_history_api,
    sos_upload_photo_api,
    sos_upload_audio_api,
    sos_upload_video_api,
)

urlpatterns = [
    # Template views
    path('', dashboard_page, name='dashboard'),
    path('sos/', sos_page, name='sos'),
    path('contacts/', contacts_page, name='contacts'),
    path('contacts/remove_trusted/', remove_trusted_contact, name='remove_trusted_contact'),
    path('contacts/delete/', delete_contact, name='delete_contact'),
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
    path("api/contacts/<int:contact_id>/delete/", delete_contact_api, name="delete-contact-api"),
    path("api/journey/", journey_api, name="journey-api"),
    path("api/sos/", sos_api, name="sos-api"),
    path("api/reports/", api_reports, name="reports-api"),
    path("api/report/", report_api, name="report-api"),

    # Enhanced Production SOS APIs
    path("api/sos/start/", sos_start_api, name="sos-start-api"),
    path("api/sos/location/", sos_location_api, name="sos-location-api"),
    path("api/sos/end/", sos_end_api, name="sos-end-api"),
    path("api/sos/history/", sos_history_api, name="sos-history-api"),
    path("api/sos/upload-photo/", sos_upload_photo_api, name="sos-upload-photo-api"),
    path("api/sos/upload-audio/", sos_upload_audio_api, name="sos-upload-audio-api"),
    path("api/sos/upload-video/", sos_upload_video_api, name="sos-upload-video-api"),
]
