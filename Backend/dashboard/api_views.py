from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from dashboard.models import SOSAlert
from reports.models import UnsafeReport
from .views import _send_sos_sms


def _get_user(request):
    """Return the logged-in UserProfile from session, or None."""
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    try:
        return UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return None


@api_view(["GET"])
def dashboard_data(request):
    user = _get_user(request)
    if user:
        contacts_qs = EmergencyContact.objects.filter(user=user, is_trusted=True)
        journey_count = Journey.objects.count()
        contact_count = EmergencyContact.objects.filter(user=user).count()
        sos_count = SOSAlert.objects.count()
    else:
        contacts_qs = EmergencyContact.objects.filter(is_trusted=True)
        journey_count = Journey.objects.count()
        contact_count = EmergencyContact.objects.count()
        sos_count = SOSAlert.objects.count()

    contacts = [
        {
            "id": p.id,
            "contact_name": p.contact_name,
            "phone_number": p.phone_number,
            "email": p.email or "",
            "relationship": p.relationship,
        }
        for p in contacts_qs
    ]

    return Response({
        "journey_count": journey_count,
        "contact_count": contact_count,
        "sos_count": sos_count,
        "contact": contacts,
    })


# ── Contacts ─────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def contacts_api(request):
    user = _get_user(request)
    if not user:
        user = UserProfile.objects.first()  # fallback for dev

    if request.method == "GET":
        contacts = EmergencyContact.objects.filter(user=user) if user else EmergencyContact.objects.all()
        data = [
            {
                "id": c.id,
                "contact_name": c.contact_name,
                "phone_number": c.phone_number,
                "email": c.email or "",
                "relationship": c.relationship,
                "is_trusted": c.is_trusted,
            }
            for c in contacts
        ]
        return Response(data)

    # POST — add a new contact
    name = request.data.get("name", "").strip()
    phone = request.data.get("phone", "").strip()
    email = request.data.get("email", "").strip()
    relationship = request.data.get("relationship", "").strip()

    if not all([name, phone, relationship]):
        return Response({"error": "Name, phone, and relationship are required."}, status=status.HTTP_400_BAD_REQUEST)

    contact = EmergencyContact.objects.create(
        user=user,
        contact_name=name,
        phone_number=phone,
        email=email or None,
        relationship=relationship,
    )
    return Response({
        "id": contact.id,
        "contact_name": contact.contact_name,
        "phone_number": contact.phone_number,
        "email": contact.email or "",
        "relationship": contact.relationship,
        "is_trusted": contact.is_trusted,
    }, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def mark_trusted_api(request, contact_id):
    try:
        contact = EmergencyContact.objects.get(id=contact_id)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)

    contact.is_trusted = not contact.is_trusted
    contact.save()
    return Response({"id": contact.id, "is_trusted": contact.is_trusted})


@api_view(["POST", "DELETE"])
def delete_contact_api(request, contact_id):
    try:
        contact = EmergencyContact.objects.get(id=contact_id)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)

    contact.delete()
    return Response({"message": "Contact deleted successfully."})


# ── Journey ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def journey_api(request):
    if request.method == "GET":
        journeys = Journey.objects.all().order_by("-start_time")
        data = [
            {
                "id": j.id,
                "source": j.source,
                "destination": j.destination,
                "transport_mode": j.transport_mode,
                "status": j.status,
                "start_time": j.start_time,
            }
            for j in journeys
        ]
        return Response(data)

    source = request.data.get("source", "").strip()
    destination = request.data.get("destination", "").strip()
    transport = request.data.get("transport", "").strip()
    force = request.data.get("force", False)

    if not all([source, destination, transport]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    # Check for unsafe area warning
    if not force:
        unsafe_areas = UnsafeReport.objects.values_list("area_name", flat=True)
        for area in unsafe_areas:
            area_lower = area.lower()
            if area_lower in source.lower() or area_lower in destination.lower():
                return Response(
                    {
                        "unsafe_warning": f"⚠️ Warning: '{area}' has been reported as an unsafe area. Please stay safe!",
                        "flagged_area": area,
                    },
                    status=status.HTTP_200_OK,
                )

    journey = Journey.objects.create(
        source=source,
        destination=destination,
        transport_mode=transport,
    )
    return Response({
        "id": journey.id,
        "source": journey.source,
        "destination": journey.destination,
        "transport_mode": journey.transport_mode,
        "status": journey.status,
        "start_time": journey.start_time,
    }, status=status.HTTP_201_CREATED)


# ── SOS ───────────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def sos_api(request):
    if request.method == "GET":
        alerts = SOSAlert.objects.all().order_by("-alert_time")
        data = [
            {
                "id": a.id,
                "alert_time": a.alert_time,
                "status": a.status,
                "location": a.location,
                "latitude": a.latitude,
                "longitude": a.longitude,
            }
            for a in alerts
        ]
        return Response(data)

    location = request.data.get("location", "")
    latitude = request.data.get("latitude", "")
    longitude = request.data.get("longitude", "")

    alert = SOSAlert.objects.create(
        status="Sent",
        location=location,
        latitude=latitude,
        longitude=longitude,
    )

    user = _get_user(request)
    if not user:
        user = UserProfile.objects.first()

    user_name = user.name if user else ""
    if user:
        trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True)
    else:
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    _send_sos_sms(location, trusted_contacts, user_name, latitude, longitude)

    return Response({
        "id": alert.id,
        "alert_time": alert.alert_time,
        "status": alert.status,
        "location": alert.location,
        "notified_count": trusted_contacts.count(),
        "message": f"SOS Alert sent! Notified {trusted_contacts.count()} trusted contact(s).",
    }, status=status.HTTP_201_CREATED)


# ── Reports ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def report_api(request):
    if request.method == "GET":
        reports = UnsafeReport.objects.all().order_by("-id")
        data = [
            {
                "id": r.id,
                "area_name": r.area_name,
                "issue_type": r.issue_type,
                "description": r.description,
                "created_at": r.created_at,
            }
            for r in reports
        ]
        return Response(data)

    location = request.data.get("location") or request.data.get("area_name") or request.data.get("area", "")
    issue_type = request.data.get("issue_type") or request.data.get("issue", "General")
    description = request.data.get("description", "").strip()

    if not location or not description:
        return Response({"error": "Location and description are required."}, status=status.HTTP_400_BAD_REQUEST)

    report = UnsafeReport.objects.create(
        area_name=location.strip(),
        issue_type=issue_type.strip(),
        description=description,
    )
    return Response({
        "id": report.id,
        "area_name": report.area_name,
        "issue_type": report.issue_type,
        "description": report.description,
        "created_at": report.created_at,
        "message": "Report submitted successfully.",
    }, status=status.HTTP_201_CREATED)

