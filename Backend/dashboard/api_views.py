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
    """Return the logged-in UserProfile from session, header, or request body/params, or fallback to first user."""
    user_id = request.session.get("user_id")
    if not user_id:
        user_id = request.headers.get("X-User-Id") or request.META.get("HTTP_X_USER_ID")
    if not user_id and hasattr(request, "data"):
        user_id = request.data.get("user_id") or request.data.get("user")
    if not user_id and hasattr(request, "POST"):
        user_id = request.POST.get("user_id") or request.POST.get("user")
    if user_id:
        try:
            return UserProfile.objects.get(id=user_id)
        except (UserProfile.DoesNotExist, ValueError):
            pass
    return UserProfile.objects.first()



@api_view(["GET"])
def dashboard_data(request):
    user = _get_user(request)
    if user:
        contacts_qs = EmergencyContact.objects.filter(user=user, is_trusted=True)
        journey_count = Journey.objects.filter(user=user).count()
        contact_count = EmergencyContact.objects.filter(user=user).count()
        sos_count = SOSAlert.objects.filter(user=user).count() + SOSSession.objects.filter(user=user).count()
    else:
        contacts_qs = EmergencyContact.objects.none()
        journey_count = 0
        contact_count = 0
        sos_count = 0

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

    if request.method == "GET":
        contacts = EmergencyContact.objects.filter(user=user) if user else EmergencyContact.objects.none()
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

    if not user:
        return Response({"error": "Authentication required. Please login."}, status=status.HTTP_401_UNAUTHORIZED)


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
    return _get_user(request)


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
        journeys = Journey.objects.filter(user=user).order_by("-start_time") if user else Journey.objects.none()
        return Response([_serialize_journey(journey) for journey in journeys])


    source = request.data.get("source", "").strip()
    destination = request.data.get("destination", "").strip()
    transport = request.data.get("transport", "").strip() or request.data.get("transport_mode", "").strip() or "Car"
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

    # Estimate journey duration (default e.g. Car: 30 min, Bus: 45 min, Train: 40 min, Walk: 25 min)
    duration_mapping = {"Car": 30, "Bus": 45, "Train": 40, "Walking": 25}
    route_estimate = _google_route_estimate(source, destination, transport)
    duration = route_estimate.get("duration_minutes") or duration_mapping.get(transport, 30)

    now = timezone.now()
    estimated_arrival = now + timedelta(minutes=duration)
    # Next periodic safety check in 10 minutes
    next_check = now + timedelta(minutes=10)

    journey = Journey.objects.create(
        user=user,
        source=source,
        destination=destination,
        transport_mode=transport,
        expected_duration_minutes=duration,
        estimated_arrival_at=estimated_arrival,
        next_safety_check_at=next_check,
        safety_check_pending=False,
    )

    # Send safety check-in email to user asking "Are you safe or not?"
    try:
        send_safety_check_email(journey)
    except Exception as e:
        print(f"Error sending safety check email: {e}")

    journey_data = _serialize_journey(journey)
    return Response({
        **journey_data,
        "journey": journey_data,
        "estimated_duration_minutes": duration,
        "message": f"Journey started! Estimated duration: {duration} mins. Safety check email sent to your inbox.",
    }, status=status.HTTP_201_CREATED)

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
    """Record safety check response (safe, not_safe, or missed)."""
    from journey.services import send_not_safe_alert_email, send_trusted_contact_escalation

    user = _journey_user(request)
    journeys = Journey.objects.filter(id=journey_id).exclude(status="Completed")
    if user:
        journeys = journeys.filter(user=user)
    journey = journeys.first()
    if not journey:
        return Response({"error": "Active journey not found."}, status=status.HTTP_404_NOT_FOUND)

    resp_type = request.data.get("response", "safe")
    now = timezone.now()

    if resp_type == "not_safe":
        journey.status = "Unsafe Alert"
        journey.safety_check_pending = False
        journey.save(update_fields=["status", "safety_check_pending", "updated_at" if hasattr(journey, "updated_at") else "status"])

        # Send URGENT NOT SAFE email to trusted contacts
        try:
            send_not_safe_alert_email(journey)
        except Exception as e:
            print(f"Error sending NOT SAFE alert email: {e}")

        # Record legacy SOS alert
        SOSAlert.objects.create(
            status="Sent",
            location=f"Journey ALERT ({journey.source} -> {journey.destination})",
        )

        return Response({
            "message": "🚨 URGENT: Emergency alert email sent to trusted contacts that you are NOT SAFE!",
            "journey": _serialize_journey(journey),
            "alert_triggered": True,
        }, status=status.HTTP_200_OK)

    elif resp_type == "missed":
        journey.missed_check_count += 1
        if journey.missed_check_count >= 2:
            journey.status = "Escalated Alert"
            journey.safety_check_pending = False
            journey.escalated_at = now
            journey.save()

            try:
                send_trusted_contact_escalation(journey)
            except Exception as e:
                print(f"Error sending escalation email: {e}")

            return Response({
                "message": "⚠️ 2 safety check-ins missed! Escalation email automatically sent to trusted contacts.",
                "journey": _serialize_journey(journey),
                "escalated": True,
            })
        else:
            journey.next_safety_check_at = now + timedelta(minutes=10)
            journey.safety_check_pending = False
            journey.save()
            return Response({
                "message": f"Safety check-in missed ({journey.missed_check_count}/2).",
                "journey": _serialize_journey(journey),
                "escalated": False,
            })

    else:
        # User clicks "I'm Safe"
        journey.missed_check_count = 0
        journey.last_safety_check_at = now
        journey.next_safety_check_at = now + timedelta(minutes=10)
        journey.safety_check_pending = False
        journey.save()

        return Response({
            "message": "✅ Check-in recorded: You are safe! Next check-in in 10 minutes.",
            "journey": _serialize_journey(journey),
        })




# ── SOS ───────────────────────────────────────────────────────────────────────

# ── SOS ───────────────────────────────────────────────────────────────────────

@api_view(["GET", "POST"])
def sos_api(request):
    user = _get_user(request)
    if request.method == "GET":
        alerts = SOSAlert.objects.filter(user=user).order_by("-alert_time") if user else SOSAlert.objects.none()
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
        user=user,
        status="Sent",
        location=location,
        latitude=latitude,
        longitude=longitude,
    )

    user_name = user.name if user else ""
    trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True) if user else EmergencyContact.objects.none()

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
    user = _get_user(request)
    if request.method == "GET":
        reports = UnsafeReport.objects.filter(user=user).order_by("-id") if user else UnsafeReport.objects.all().order_by("-id")
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
        user=user,
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
    """POST /api/sos/start/ — Starts a new SOS emergency session or triggers an alert on active session."""
    user = _get_user(request)
    lat = str(request.data.get("latitude", "") or "").strip()
    lon = str(request.data.get("longitude", "") or "").strip()
    location = request.data.get("location", "").strip() or "Emergency GPS Location Alert"

    user_name = user.name if user else ""
    trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True) if user else EmergencyContact.objects.filter(is_trusted=True)
    if not trusted_contacts.exists():
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    # Send SOS alert email and SMS ONLY to trusted contacts when SOS is triggered!
    print(f"[SOS TRIGGER] Sending SOS alert email to {trusted_contacts.count()} trusted contact(s)...")
    _send_sos_sms(location, trusted_contacts, user_name, lat, lon)




    # Check for existing active session
    active_session = SOSSession.objects.filter(status="Active")
    if user:
        active_session = active_session.filter(user=user)

    active_obj = active_session.first()
    if active_obj:
        active_obj.last_known_location = location
        if lat and lon:
            active_obj.initial_latitude = lat
            active_obj.initial_longitude = lon
            SOSLocation.objects.create(
                session=active_obj,
                latitude=lat,
                longitude=lon,
                accuracy=request.data.get("accuracy"),
                location_name=location,
            )
        active_obj.save()
        SOSAlert.objects.create(user=user, status="Sent", location=location, latitude=lat, longitude=lon)

        serializer = SOSSessionSerializer(active_obj, context={"request": request})
        return Response(
            {
                "message": f"🚨 SOS Emergency Alert Sent! Notified {trusted_contacts.count()} trusted contact(s).",
                "session": serializer.data,
                "is_new": False,
            },
            status=status.HTTP_200_OK,
        )

    # Create new session if no active session exists
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
    SOSAlert.objects.create(user=user, status="Sent", location=location, latitude=lat, longitude=lon)

    serializer = SOSSessionSerializer(session, context={"request": request})
    return Response(
        {
            "message": f"🚨 EMERGENCY SOS ACTIVATED! Notified {trusted_contacts.count()} contact(s).",
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
    session_user = session.user or _get_user(request) or UserProfile.objects.first()
    user_name = session_user.name if session_user else "SafeHer User"
    trusted_contacts = EmergencyContact.objects.filter(user=session_user, is_trusted=True) if session_user else EmergencyContact.objects.filter(is_trusted=True)
    if not trusted_contacts.exists():
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    mins = session.duration_seconds // 60
    secs = session.duration_seconds % 60
    duration_str = f"{mins} min {secs} sec" if mins > 0 else f"{secs} seconds"

    print(f"[SOS END] Automatically sending 'I'm Safe' email to {trusted_contacts.count()} trusted contact(s)...")
    _send_safe_email(
        trusted_contacts=trusted_contacts,
        user_name=user_name,
        duration_str=duration_str,
        location=session.last_known_location or session.initial_location or "Location not specified",
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
    queryset = SOSSession.objects.filter(user=user) if user else SOSSession.objects.none()


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


def _detect_media_mimetype(filename, media_type=""):
    """Returns exact MIME type so email clients natively support and render audio/video/image attachments."""
    fn = str(filename).lower()
    if fn.endswith(".mp4") or fn.endswith(".m4v"):
        return "video/mp4"
    if fn.endswith(".webm"):
        return "video/webm" if "video" in media_type.lower() else "audio/webm"
    if fn.endswith(".mp3"):
        return "audio/mpeg"
    if fn.endswith(".m4a") or fn.endswith(".aac"):
        return "audio/mp4"
    if fn.endswith(".ogg") or fn.endswith(".ogv"):
        return "audio/ogg"
    if fn.endswith(".wav"):
        return "audio/wav"
    if fn.endswith(".jpg") or fn.endswith(".jpeg"):
        return "image/jpeg"
    if fn.endswith(".png"):
        return "image/png"

    mt = media_type.lower()
    if "video" in mt:
        return "video/mp4"
    if "audio" in mt:
        return "audio/mp4"
    if "photo" in mt or "image" in mt:
        return "image/jpeg"
    return "application/octet-stream"


def _send_sos_media_email(session, media_type, file_field, request=None):
    """Instantly send compressed media attachment (photo/audio/video) with valid MIME type headers to all trusted contacts."""
    from django.core.mail import EmailMultiAlternatives
    from .views import _relationship_message

    user = session.user or _get_user(request) or UserProfile.objects.first()
    if not user:
        print(f"[MEDIA EMAIL] No user found for session #{session.id}")
        return

    user_name = user.name
    location = session.last_known_location or session.initial_location or "Location not specified"
    trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True) if user else EmergencyContact.objects.filter(is_trusted=True)
    if not trusted_contacts.exists():
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)

    if not trusted_contacts.exists():
        print(f"[MEDIA EMAIL] No trusted contacts configured in database")
        return



    for contact in trusted_contacts:
        if not contact.email:
            continue

        sender_desc = _relationship_message(contact.relationship)
        subject = f"🚨 URGENT SOS MEDIA EVIDENCE: {media_type} from {user_name}!"

        plain_text = (
            f"Dear {contact.contact_name},\n\n"
            f"🚨 URGENT SOS MEDIA RECORDING\n\n"
            f"{sender_desc} ({user_name}) has uploaded a new emergency {media_type} during an active SOS alert!\n\n"
            f"📍 Last Known Location:\n{location}\n\n"
            f"The recorded media file is attached to this email.\n\n"
            f"Please check on them or call emergency services (112) immediately.\n\n— SafeHer Safety App"
        )

        html_content = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="background:#e53935;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:22px;">🚨 SOS MEDIA EVIDENCE ({media_type.upper()})</h1>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;color:#333;">Dear <strong>{contact.contact_name}</strong>,</p>
            <div style="background:#fff3e0;border-left:4px solid #e53935;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0;font-size:16px;color:#b71c1c;font-weight:bold;">
                {sender_desc} ({user_name}) has just recorded and sent a compressed <u>{media_type}</u> during their active SOS emergency!
              </p>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">📍 Last Known Location</p>
              <p style="margin:0;font-size:15px;color:#333;font-weight:600;">{location}</p>
            </div>
            <div style="background:#ffebee;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#c62828;font-weight:bold;">
                📎 The recorded {media_type.lower()} file has been attached to this email.
              </p>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;">Sent immediately by SafeHer Safety Console</p>
          </div>
        </div>
        """

        try:
            sender_email = f"SafeHer Emergency Console <{settings.EMAIL_HOST_USER}>"
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=sender_email,
                to=[contact.email],
                headers={"X-Priority": "1", "Priority": "urgent", "Importance": "High"},
            )
            msg.attach_alternative(html_content, "text/html")


            if file_field and hasattr(file_field, "path"):
                try:
                    filename = file_field.name.split("/")[-1].split("\\")[-1]
                    mimetype = _detect_media_mimetype(filename, media_type)
                    with open(file_field.path, "rb") as f:
                        msg.attach(filename, f.read(), mimetype)
                    print(f"[MEDIA EMAIL SUCCESS] Attached {filename} ({mimetype}) for {contact.contact_name}")
                except Exception as fe:
                    print("Error attaching file from path:", fe)
            elif file_field and hasattr(file_field, "read"):
                try:
                    filename = getattr(file_field, "name", f"sos_{media_type.lower()}.mp4")
                    mimetype = _detect_media_mimetype(filename, media_type)
                    file_field.seek(0)
                    msg.attach(filename, file_field.read(), mimetype)
                    print(f"[MEDIA EMAIL SUCCESS] Attached stream {filename} ({mimetype}) for {contact.contact_name}")
                except Exception as fe:
                    print("Error attaching file from stream:", fe)

            msg.send(fail_silently=False)
            print(f"SOS media email ({media_type}) sent to {contact.contact_name} <{contact.email}>")
        except Exception as e:
            print(f"Error sending SOS media email to {contact.contact_name}: {e}")



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
    _send_sos_media_email(session, "Photo", photo.image, request)

    serializer = SOSPhotoSerializer(photo, context={"request": request})
    return Response({"message": "Photo uploaded and sent to trusted contacts successfully.", "photo": serializer.data}, status=status.HTTP_201_CREATED)


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
    _send_sos_media_email(session, "Audio Recording", audio.audio_file, request)

    serializer = SOSAudioSerializer(audio, context={"request": request})
    return Response({"message": "Audio recording uploaded and sent to trusted contacts successfully.", "audio": serializer.data}, status=status.HTTP_201_CREATED)


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
    _send_sos_media_email(session, "Video Recording", video.video_file, request)

    serializer = SOSVideoSerializer(video, context={"request": request})
    return Response({"message": "Video recording uploaded and sent to trusted contacts successfully.", "video": serializer.data}, status=status.HTTP_201_CREATED)


