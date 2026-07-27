from rest_framework.decorators import api_view
from rest_framework.response import Response
from rest_framework import status

from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from dashboard.models import SOSAlert
from reports.models import UnsafeReport


@api_view(["GET"])
def dashboard_data(request):
    user_id = request.session.get("user_id")
    trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)
    if user_id:
        trusted_contacts = trusted_contacts.filter(user_id=user_id)

    contacts = [
        {
            "id": person.id,
            "contact_name": person.contact_name,
            "phone_number": person.phone_number,
            "relationship": person.relationship,
        }
        for person in trusted_contacts
    ]

    return Response({
        "journey_count": Journey.objects.count(),
        "contact_count": EmergencyContact.objects.count(),
        "sos_count": SOSAlert.objects.count(),
        "contact": contacts
    })


@api_view(["GET", "POST"])
def api_contacts(request):
    user_id = request.session.get("user_id")
    user = UserProfile.objects.filter(id=user_id).first() or UserProfile.objects.first()

    if not user:
        user, _ = UserProfile.objects.get_or_create(
            email="guest@safeher.com",
            defaults={"name": "Guest User", "phone": "9999999999", "password": "password123"}
        )

    if request.method == "POST":
        name = request.data.get("name", "").strip() or request.data.get("contact_name", "").strip()
        phone = request.data.get("phone", "").strip() or request.data.get("phone_number", "").strip()
        relationship = request.data.get("relationship", "").strip()

        if not name or not phone or not relationship:
            return Response({"error": "All fields (name, phone, relationship) are required."}, status=status.HTTP_400_BAD_REQUEST)

        contact = EmergencyContact.objects.create(
            user=user,
            contact_name=name,
            phone_number=phone,
            relationship=relationship
        )
        return Response({
            "message": "Contact added successfully.",
            "contact": {
                "id": contact.id,
                "contact_name": contact.contact_name,
                "phone_number": contact.phone_number,
                "relationship": contact.relationship,
                "is_trusted": contact.is_trusted,
            }
        }, status=status.HTTP_201_CREATED)

    contacts = EmergencyContact.objects.all()
    if user_id:
        contacts = contacts.filter(user_id=user_id)

    contacts_list = [
        {
            "id": c.id,
            "contact_name": c.contact_name,
            "phone_number": c.phone_number,
            "relationship": c.relationship,
            "is_trusted": c.is_trusted,
        }
        for c in contacts
    ]
    return Response(contacts_list, status=status.HTTP_200_OK)


@api_view(["POST"])
def api_add_trusted_contact(request):
    contact_id = request.data.get("contact_id")
    if not contact_id:
        return Response({"error": "Contact ID is required."}, status=status.HTTP_400_BAD_REQUEST)

    try:
        contact = EmergencyContact.objects.get(id=contact_id)
        contact.is_trusted = True
        contact.save()
        return Response({"message": "Added to trusted contacts."}, status=status.HTTP_200_OK)
    except EmergencyContact.DoesNotExist:
        return Response({"error": "Contact not found."}, status=status.HTTP_404_NOT_FOUND)


@api_view(["GET", "POST"])
def api_journeys(request):
    if request.method == "POST":
        source = request.data.get("source", "").strip()
        destination = request.data.get("destination", "").strip()
        transport = request.data.get("transport", "").strip()

        if not source or not destination or not transport:
            return Response({"error": "Source, destination, and transport mode are required."}, status=status.HTTP_400_BAD_REQUEST)

        journey = Journey.objects.create(
            source=source,
            destination=destination,
            transport_mode=transport,
            status="Active"
        )
        return Response({
            "message": "Journey started.",
            "journey": {
                "id": journey.id,
                "source": journey.source,
                "destination": journey.destination,
                "transport_mode": journey.transport_mode,
                "status": journey.status,
                "start_time": journey.start_time.strftime("%Y-%m-%d %H:%M"),
            }
        }, status=status.HTTP_201_CREATED)

    journeys = Journey.objects.all().order_by("-id")
    result = [
        {
            "id": j.id,
            "source": j.source,
            "destination": j.destination,
            "transport_mode": j.transport_mode,
            "status": j.status,
            "start_time": j.start_time.strftime("%Y-%m-%d %H:%M") if j.start_time else "",
        }
        for j in journeys
    ]
    return Response(result, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def api_sos(request):
    if request.method == "POST":
        location = request.data.get("location", "").strip() or "Emergency GPS Location Alert"
        latitude = request.data.get("latitude", "")
        longitude = request.data.get("longitude", "")

        alert = SOSAlert.objects.create(
            status="Sent",
            location=location,
            latitude=latitude,
            longitude=longitude
        )
        return Response({
            "message": "SOS Alert sent successfully!",
            "alert": {
                "id": alert.id,
                "alert_time": alert.alert_time.strftime("%Y-%m-%d %H:%M"),
                "status": alert.status,
                "location": alert.location,
            }
        }, status=status.HTTP_201_CREATED)

    alerts = SOSAlert.objects.all().order_by("-id")
    result = [
        {
            "id": a.id,
            "alert_time": a.alert_time.strftime("%Y-%m-%d %H:%M") if a.alert_time else "",
            "status": a.status,
            "location": a.location or "Location not specified",
        }
        for a in alerts
    ]
    return Response(result, status=status.HTTP_200_OK)


@api_view(["GET", "POST"])
def api_reports(request):
    if request.method == "POST":
        area = request.data.get("area", "").strip() or request.data.get("area_name", "").strip() or request.data.get("location", "").strip()
        issue = request.data.get("issue", "").strip() or request.data.get("issue_type", "").strip() or "Unsafe Area"
        description = request.data.get("description", "").strip()

        if not area or not description:
            return Response({"error": "Area and description are required."}, status=status.HTTP_400_BAD_REQUEST)

        rep = UnsafeReport.objects.create(
            area_name=area,
            issue_type=issue,
            description=description
        )
        return Response({
            "message": "Unsafe report submitted successfully.",
            "report": {
                "id": rep.id,
                "area_name": rep.area_name,
                "issue_type": rep.issue_type,
                "description": rep.description,
            }
        }, status=status.HTTP_201_CREATED)

    reports = UnsafeReport.objects.all().order_by("-id")
    result = [
        {
            "id": r.id,
            "area_name": r.area_name,
            "issue_type": r.issue_type,
            "description": r.description,
        }
        for r in reports
    ]
    return Response(result, status=status.HTTP_200_OK)