import json
from datetime import timedelta
from urllib.error import HTTPError, URLError
from urllib.request import Request, urlopen

from django.conf import settings
from django.utils import timezone
from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from dashboard.models import SOSAlert
from reports.models import UnsafeReport
from .views import _send_sos_sms
from journey.services import send_safety_check_email, send_trusted_contact_escalation


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
    else:
        contacts_qs = EmergencyContact.objects.filter(is_trusted=True)

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
        "journey_count": Journey.objects.count(),
        "contact_count": EmergencyContact.objects.filter(user=user).count() if user else EmergencyContact.objects.count(),
        "sos_count": SOSAlert.objects.count(),
        "contact": contacts,
    })


# ── Contacts ─────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def contacts_api(request):
    user = _get_user(request)
    if not user:
        user = UserProfile.objects.first()

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
    name = request.data.get("name", "").strip() or request.data.get("contact_name", "").strip()
    phone = request.data.get("phone", "").strip() or request.data.get("phone_number", "").strip()
    email = request.data.get("email", "").strip()
    relationship = request.data.get("relationship", "").strip()

    if not all([name, phone, relationship]):
        return Response({"error": "Name, phone, and relationship are required."}, status=status.HTTP_400_BAD_REQUEST)

    if not phone.isdigit() or len(phone) != 10:
        return Response({"error": "Phone number must be exactly 10 digits."}, status=status.HTTP_400_BAD_REQUEST)

    if email and "@" not in email:
        return Response({"error": "Please enter a valid email address."}, status=status.HTTP_400_BAD_REQUEST)

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
        "contact": {
            "id": contact.id,
            "contact_name": contact.contact_name,
            "phone_number": contact.phone_number,
            "relationship": contact.relationship,
            "is_trusted": contact.is_trusted,
        }
    }, status=status.HTTP_201_CREATED)

api_contacts = contacts_api


@api_view(["POST"])
def mark_trusted_api(request, contact_id):
    try:
        contact = EmergencyContact.objects.get(id=contact_id)
        contact.is_trusted = not contact.is_trusted
        contact.save()
        return Response({"id": contact.id, "is_trusted": contact.is_trusted}, status=status.HTTP_200_OK)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST"])
def api_add_trusted_contact(request):
    contact_id = request.data.get("contact_id")
    if not contact_id:
        return Response({"error": "Contact ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contact = EmergencyContact.objects.get(id=contact_id)
        contact.is_trusted = True
        contact.save()
        return Response({"message": "Added to trusted contacts.", "id": contact.id, "is_trusted": True}, status=status.HTTP_200_OK)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["POST", "DELETE"])
def delete_contact_api(request, contact_id):
    try:
        contact = EmergencyContact.objects.get(id=contact_id)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)

    contact.delete()
    return Response({"message": "Contact deleted successfully."})


TRANSPORT_TO_GOOGLE_MODE = {
    "Car": "DRIVE",
    "Bus": "TRANSIT",
    "Train": "TRANSIT",
    "Walking": "WALK",
}


def _journey_user(request):
    return _get_user(request) or UserProfile.objects.first()


def _duration_minutes(duration):
    try:
        return max(1, round(int(str(duration).rstrip("s")) / 60))
    except (TypeError, ValueError):
        return None


def _google_route_estimate(source, destination, transport):
    """Use Google Routes data so the displayed ETA follows Google Maps traffic data."""
    api_key = getattr(settings, "GOOGLE_MAPS_API_KEY", "")
    if not api_key:
        return {"available": False, "message": "Add GOOGLE_MAPS_API_KEY to enable the live Google Maps ETA."}

    payload = {
        "origin": {"address": source},
        "destination": {"address": destination},
        "travelMode": TRANSPORT_TO_GOOGLE_MODE.get(transport, "DRIVE"),
        "departureTime": timezone.now().isoformat(),
    }
    if payload["travelMode"] == "DRIVE":
        payload["routingPreference"] = "TRAFFIC_AWARE"
    route_request = Request(
        "https://routes.googleapis.com/directions/v2:computeRoutes",
        data=json.dumps(payload).encode("utf-8"),
        headers={
            "Content-Type": "application/json",
            "X-Goog-Api-Key": api_key,
            "X-Goog-FieldMask": "routes.duration,routes.distanceMeters",
        },
        method="POST",
    )
    try:
        with urlopen(route_request, timeout=10) as response:
            data = json.loads(response.read().decode("utf-8"))
        route = (data.get("routes") or [None])[0]
        minutes = _duration_minutes(route.get("duration") if route else None)
        if not minutes:
            return {"available": False, "message": "Google Maps did not return a route for these locations."}
        return {
            "available": True,
            "duration_minutes": minutes,
            "distance_meters": route.get("distanceMeters"),
            "message": f"Google Maps ETA: about {minutes} min",
        }
    except HTTPError as error:
        return {
            "available": False,
            "message": f"Google Maps denied the ETA request (HTTP {error.code}). Check that billing is active and Routes API is enabled for this key.",
        }
    except (URLError, TimeoutError):
        return {"available": False, "message": "SafeHer could not reach Google Maps. Check your internet connection and try again."}
    except (ValueError, json.JSONDecodeError):
        return {"available": False, "message": "Google Maps returned an invalid route response. Check the source and destination."}


def _serialize_journey(journey):
    return {
        "id": journey.id,
        "source": journey.source,
        "destination": journey.destination,
        "transport_mode": journey.transport_mode,
        "status": journey.status,
        "start_time": journey.start_time,
        "completed_at": journey.completed_at,
        "expected_duration_minutes": journey.expected_duration_minutes,
        "estimated_arrival_at": journey.estimated_arrival_at,
        "safety_check_pending": journey.safety_check_pending,
        "safety_check_count": journey.safety_check_count,
        "missed_check_count": journey.missed_check_count,
        "escalated_at": journey.escalated_at,
    }


# ── Journey ───────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def journey_api(request):
    user = _journey_user(request)
    if request.method == "GET":
        journeys = Journey.objects.filter(user=user).order_by("-start_time") if user else Journey.objects.all().order_by("-start_time")
        return Response([_serialize_journey(journey) for journey in journeys])

    source = request.data.get("source", "").strip()
    destination = request.data.get("destination", "").strip()
    transport = request.data.get("transport", "").strip() or request.data.get("transport_mode", "").strip()
    force = request.data.get("force", False)

    if not all([source, destination, transport]):
        return Response({"error": "Source, destination, and transport mode are required."}, status=status.HTTP_400_BAD_REQUEST)

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

    route_estimate = _google_route_estimate(source, destination, transport)
    duration = route_estimate.get("duration_minutes")
    estimated_arrival = timezone.now() + timedelta(minutes=duration) if duration else None
    journey = Journey.objects.create(
        user=user,
        source=source,
        destination=destination,
        transport_mode=transport,
        expected_duration_minutes=duration,
        estimated_arrival_at=estimated_arrival,
        next_safety_check_at=estimated_arrival,
    )
    journey_data = _serialize_journey(journey)
    return Response({**journey_data, "journey": journey_data, "route_estimate": route_estimate}, status=status.HTTP_201_CREATED)

api_journeys = journey_api


@api_view(["POST"])
def journey_estimate_api(request):
    source = request.data.get("source", "").strip()
    destination = request.data.get("destination", "").strip()
    transport = request.data.get("transport", "Car").strip()
    if not source or not destination:
        return Response({"error": "Source and destination are required."}, status=status.HTTP_400_BAD_REQUEST)
    return Response(_google_route_estimate(source, destination, transport))


@api_view(["GET"])
def active_journey_api(request):
    user = _journey_user(request)
    journeys = Journey.objects.filter(status="Active")
    if user:
        journeys = journeys.filter(user=user)
    journey = journeys.order_by("-start_time").first()
    return Response({"journey": _serialize_journey(journey) if journey else None})


@api_view(["POST"])
def journey_complete_api(request, journey_id):
    user = _journey_user(request)
    journeys = Journey.objects.filter(id=journey_id)
    if user:
        journeys = journeys.filter(user=user)
    journey = journeys.first()
    if not journey:
        return Response({"error": "Journey not found."}, status=status.HTTP_404_NOT_FOUND)

    journey.status = "Completed"
    journey.completed_at = timezone.now()
    journey.safety_check_pending = False
    journey.next_safety_check_at = None
    journey.save(update_fields=["status", "completed_at", "safety_check_pending", "next_safety_check_at"])
    return Response({"message": "Journey completed safely.", "journey": _serialize_journey(journey)})


@api_view(["POST"])
def journey_check_in_api(request, journey_id):
    """Record an answer to safety check or send a safety check-in notice."""
    user = _journey_user(request)
    journeys = Journey.objects.filter(id=journey_id, status="Active")
    if user:
        journeys = journeys.filter(user=user)
    journey = journeys.first()
    if not journey:
        return Response({"error": "Active journey not found."}, status=status.HTTP_404_NOT_FOUND)

    resp_type = request.data.get("response", "safe_notice")

    if resp_type == "safe_notice":
        journey.last_safety_check_at = timezone.now()
        journey.missed_check_count = 0
        journey.save(update_fields=["last_safety_check_at", "missed_check_count"])

        try:
            trusted = EmergencyContact.objects.filter(user=user, is_trusted=True) if user else EmergencyContact.objects.filter(is_trusted=True)
            send_safety_check_email(journey, list(trusted))
        except Exception as e:
            print(f"Error sending safety check-in email: {e}")

        return Response({
            "message": "Safety notice sent: Trusted contacts notified that you are safe! 🛡️",
            "journey": _serialize_journey(journey)
        })
    elif resp_type == "safe":
        journey.status = "Completed"
        journey.completed_at = timezone.now()
        journey.next_safety_check_at = None
        journey.safety_check_pending = False
        message = "Thanks for checking in. Your journey is marked completed."
    else:
        journey.safety_check_pending = False
        journey.missed_check_count = 0
        journey.next_safety_check_at = timezone.now() + timedelta(minutes=getattr(settings, "SAFETY_CHECK_INTERVAL_MINUTES", 10))
        message = "Check-in recorded. We will ask again if your journey continues."

    journey.save()
    return Response({"message": message, "journey": _serialize_journey(journey)})



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
                "location": a.location or "Location not specified",
                "latitude": a.latitude,
                "longitude": a.longitude,
            }
            for a in alerts
        ]
        return Response(data)

    location = request.data.get("location", "").strip() or "Emergency GPS Location Alert"
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
        "alert": {
            "id": alert.id,
            "alert_time": alert.alert_time,
            "status": alert.status,
            "location": alert.location,
        }
    }, status=status.HTTP_201_CREATED)

api_sos = sos_api


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
        "report": {
            "id": report.id,
            "area_name": report.area_name,
            "issue_type": report.issue_type,
            "description": report.description,
        }
    }, status=status.HTTP_201_CREATED)

api_reports = report_api


# ── Enhanced Production SOS APIs ─────────────────────────────────────────────

from django.utils import timezone
from django.db.models import Q
from .models import SOSSession, SOSLocation, SOSPhoto, SOSAudio, SOSVideo
from .serializers import (
    SOSSessionSerializer,
    SOSLocationSerializer,
    SOSPhotoSerializer,
    SOSAudioSerializer,
    SOSVideoSerializer,
)


@api_view(["POST"])
def sos_start_api(request):
    """POST /api/sos/start/ — Starts a new SOS emergency session."""
    user = _get_user(request)
    if not user:
        user = UserProfile.objects.first()

    # Prevent duplicate active sessions
    active_session = SOSSession.objects.filter(status="Active")
    if user:
        active_session = active_session.filter(user=user)

    active_obj = active_session.first()
    if active_obj:
        serializer = SOSSessionSerializer(active_obj, context={"request": request})
        return Response(
            {
                "message": "An active SOS session is already in progress.",
                "session": serializer.data,
                "is_new": False,
            },
            status=status.HTTP_200_OK,
        )

    lat = str(request.data.get("latitude", "") or "").strip()
    lon = str(request.data.get("longitude", "") or "").strip()
    location = request.data.get("location", "").strip() or "Emergency GPS Location Alert"

    session = SOSSession.objects.create(
        user=user,
        status="Active",
        initial_latitude=lat,
        initial_longitude=lon,
        initial_location=location,
        last_known_location=location,
    )

    # Log initial location
    if lat and lon:
        SOSLocation.objects.create(
            session=session,
            latitude=lat,
            longitude=lon,
            accuracy=request.data.get("accuracy"),
            location_name=location,
        )

    # Sync with legacy SOSAlert model for dashboard metrics
    SOSAlert.objects.create(status="Sent", location=location, latitude=lat, longitude=lon)

    # Notify trusted contacts via SMS
    user_name = user.name if user else ""
    trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True) if user else EmergencyContact.objects.filter(is_trusted=True)
    _send_sos_sms(location, trusted_contacts, user_name, lat, lon)

    serializer = SOSSessionSerializer(session, context={"request": request})
    return Response(
        {
            "message": f"Emergency SOS activated! Notified {trusted_contacts.count()} contact(s).",
            "session": serializer.data,
            "is_new": True,
        },
        status=status.HTTP_201_CREATED,
    )


@api_view(["POST"])
def sos_location_api(request):
    """POST /api/sos/location/ — 15-second continuous GPS location update."""
    session_id = request.data.get("session_id")
    lat = str(request.data.get("latitude", "") or "").strip()
    lon = str(request.data.get("longitude", "") or "").strip()
    accuracy = request.data.get("accuracy")
    location_name = request.data.get("location_name", "").strip() or request.data.get("location", "").strip()

    if not session_id or not lat or not lon:
        return Response({"error": "session_id, latitude, and longitude are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = SOSSession.objects.get(id=session_id)
    except SOSSession.DoesNotExist:
        return Response({"error": "SOS session not found."}, status=status.HTTP_404_NOT_FOUND)

    location_obj = SOSLocation.objects.create(
        session=session,
        latitude=lat,
        longitude=lon,
        accuracy=accuracy if isinstance(accuracy, (int, float)) else None,
        location_name=location_name or session.last_known_location,
    )

    if location_name:
        session.last_known_location = location_name
        session.save(update_fields=["last_known_location", "updated_at"])

    serializer = SOSLocationSerializer(location_obj)
    return Response({"message": "Location update saved.", "location": serializer.data}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def sos_end_api(request):
    """POST /api/sos/end/ — Ends active SOS session ("I'm Safe")."""
    from .views import _send_safe_email

    session_id = request.data.get("session_id")
    if not session_id:
        # Fallback to latest active session for user
        user = _get_user(request)
        active_qs = SOSSession.objects.filter(status="Active")
        if user:
            active_qs = active_qs.filter(user=user)
        session = active_qs.first()
    else:
        try:
            session = SOSSession.objects.get(id=session_id)
        except SOSSession.DoesNotExist:
            session = None

    if not session:
        return Response({"error": "No active SOS session found."}, status=status.HTTP_404_NOT_FOUND)

    session.end_time = timezone.now()
    if session.start_time:
        diff = (session.end_time - session.start_time).total_seconds()
        session.duration_seconds = max(0, int(diff))

    session.status = "Resolved"
    session.save()

    # Send "I'm Safe" email to all trusted contacts
    user = _get_user(request) or session.user or UserProfile.objects.first()
    user_name = user.name if user else ""
    if user:
        trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True)
    else:
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    mins = session.duration_seconds // 60
    secs = session.duration_seconds % 60
    duration_str = f"{mins} min {secs} sec" if mins > 0 else f"{secs} seconds"

    _send_safe_email(
        trusted_contacts=trusted_contacts,
        user_name=user_name,
        duration_str=duration_str,
        location=session.last_known_location or session.initial_location,
    )

    serializer = SOSSessionSerializer(session, context={"request": request})
    return Response(
        {
            "message": f"SOS session marked as Resolved. Email sent to {trusted_contacts.count()} trusted contact(s)! Stay safe! 💖",
            "session": serializer.data,
        },
        status=status.HTTP_200_OK,
    )



@api_view(["GET"])
def sos_history_api(request):
    """GET /api/sos/history/ — Lists past SOS sessions with search, date filters, and pagination."""
    user = _get_user(request)
    queryset = SOSSession.objects.all()
    if user:
        queryset = queryset.filter(user=user)

    # Search filter
    q = request.query_params.get("q", "").strip()
    if q:
        queryset = queryset.filter(
            Q(initial_location__icontains=q) |
            Q(last_known_location__icontains=q) |
            Q(status__icontains=q)
        )

    # Date range filters
    start_date = request.query_params.get("start_date", "").strip()
    end_date = request.query_params.get("end_date", "").strip()
    if start_date:
        queryset = queryset.filter(start_time__date__gte=start_date)
    if end_date:
        queryset = queryset.filter(start_time__date__lte=end_date)

    # Pagination
    page = int(request.query_params.get("page", 1))
    page_size = int(request.query_params.get("page_size", 10))
    total_count = queryset.count()

    start_idx = (page - 1) * page_size
    end_idx = start_idx + page_size
    paginated_qs = queryset[start_idx:end_idx]

    serializer = SOSSessionSerializer(paginated_qs, many=True, context={"request": request})
    return Response({
        "total": total_count,
        "page": page,
        "page_size": page_size,
        "total_pages": (total_count + page_size - 1) // page_size if page_size > 0 else 1,
        "results": serializer.data,
    })


@api_view(["POST"])
def sos_upload_photo_api(request):
    """POST /api/sos/upload-photo/ — Upload photo for SOS session."""
    session_id = request.data.get("session_id")
    image_file = request.FILES.get("image") or request.FILES.get("file") or request.FILES.get("photo")

    if not session_id or not image_file:
        return Response({"error": "session_id and image file are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = SOSSession.objects.get(id=session_id)
    except SOSSession.DoesNotExist:
        return Response({"error": "SOS session not found."}, status=status.HTTP_404_NOT_FOUND)

    photo = SOSPhoto.objects.create(session=session, image=image_file)
    serializer = SOSPhotoSerializer(photo, context={"request": request})
    return Response({"message": "Photo uploaded successfully.", "photo": serializer.data}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def sos_upload_audio_api(request):
    """POST /api/sos/upload-audio/ — Upload audio recording for SOS session."""
    session_id = request.data.get("session_id")
    audio_file = request.FILES.get("audio_file") or request.FILES.get("audio") or request.FILES.get("file")
    duration = int(request.data.get("duration", 0) or request.data.get("duration_seconds", 0) or 0)

    if not session_id or not audio_file:
        return Response({"error": "session_id and audio file are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = SOSSession.objects.get(id=session_id)
    except SOSSession.DoesNotExist:
        return Response({"error": "SOS session not found."}, status=status.HTTP_404_NOT_FOUND)

    audio = SOSAudio.objects.create(session=session, audio_file=audio_file, duration_seconds=duration)
    serializer = SOSAudioSerializer(audio, context={"request": request})
    return Response({"message": "Audio recording uploaded successfully.", "audio": serializer.data}, status=status.HTTP_201_CREATED)


@api_view(["POST"])
def sos_upload_video_api(request):
    """POST /api/sos/upload-video/ — Upload video recording for SOS session."""
    session_id = request.data.get("session_id")
    video_file = request.FILES.get("video_file") or request.FILES.get("video") or request.FILES.get("file")
    duration = int(request.data.get("duration", 0) or request.data.get("duration_seconds", 0) or 0)

    if not session_id or not video_file:
        return Response({"error": "session_id and video file are required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        session = SOSSession.objects.get(id=session_id)
    except SOSSession.DoesNotExist:
        return Response({"error": "SOS session not found."}, status=status.HTTP_404_NOT_FOUND)

    video = SOSVideo.objects.create(session=session, video_file=video_file, duration_seconds=duration)
    serializer = SOSVideoSerializer(video, context={"request": request})
    return Response({"message": "Video recording uploaded successfully.", "video": serializer.data}, status=status.HTTP_201_CREATED)

