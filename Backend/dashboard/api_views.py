from rest_framework.decorators import api_view
from rest_framework.response import Response

from journey.models import Journey
from authentication.models import EmergencyContact
from dashboard.models import SOSAlert


@api_view(["GET"])
def dashboard_data(request):

    trusted_contacts = EmergencyContact.objects.filter(
        is_trusted=True
    )

    contacts = []

    for person in trusted_contacts:

        contacts.append({

            "id": person.id,
            "contact_name": person.contact_name,
            "phone_number": person.phone_number,
            "relationship": person.relationship,

        })

    return Response({

        "journey_count": Journey.objects.count(),
        "contact_count": EmergencyContact.objects.count(),
        "sos_count": SOSAlert.objects.count(),
        "contact": contacts

    })