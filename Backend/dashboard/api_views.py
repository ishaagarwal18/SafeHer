from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from dashboard.models import SOSAlert
from reports.models import UnsafeReport


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
        contacts = EmergencyContact.objects.filter(user=user)
        data = [
            {
                "id": c.id,
                "contact_name": c.contact_name,
                "phone_number": c.phone_number,
                "relationship": c.relationship,
                "is_trusted": c.is_trusted,
            }
            for c in contacts
        ]
        return Response(data)

    # POST — add a new contact
    name = request.data.get("name", "").strip()
    phone = request.data.get("phone", "").strip()
    relationship = request.data.get("relationship", "").strip()

    if not all([name, phone, relationship]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

    contact = EmergencyContact.objects.create(
        user=user,
        contact_name=name,
        phone_number=phone,
        relationship=relationship,
    )
    return Response({
        "id": contact.id,
        "contact_name": contact.contact_name,
        "phone_number": contact.phone_number,
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

    if not all([source, destination, transport]):
        return Response({"error": "All fields are required."}, status=status.HTTP_400_BAD_REQUEST)

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
    return Response({
        "id": alert.id,
        "alert_time": alert.alert_time,
        "status": alert.status,
        "location": alert.location,
    }, status=status.HTTP_201_CREATED)


# ── Reports ───────────────────────────────────────────────────────────────────

@api_view(["POST"])
def report_api(request):
    location = request.data.get("location", "").strip()
    description = request.data.get("description", "").strip()

    if not location or not description:
        return Response({"error": "Location and description are required."}, status=status.HTTP_400_BAD_REQUEST)

    UnsafeReport.objects.create(
        area_name=location,
        issue_type="General",
        description=description,
    )
    return Response({"message": "Report submitted successfully."}, status=status.HTTP_201_CREATED)
