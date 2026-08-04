from unittest.mock import patch

from django.test import RequestFactory, TestCase

from authentication.models import EmergencyContact, UserProfile
from dashboard.api_views import contacts_api
from dashboard.views import _send_sos_sms


class ContactsSOSTests(TestCase):
    def setUp(self):
        self.factory = RequestFactory()
        self.user = UserProfile.objects.create(
            name="Test User",
            email="user@example.com",
            password="secret",
            phone="9876543210",
        )

    def _make_request(self, data=None):
        request = self.factory.post("/api/contacts/", data or {})
        session = self.client.session
        session["user_id"] = self.user.id
        session.save()
        request.session = session
        return request

    def test_contact_with_email_and_phone_is_auto_trusted(self):
        request = self._make_request({
            "name": "Asha",
            "phone": "9876543210",
            "email": "asha@example.com",
            "relationship": "Friend",
        })

        response = contacts_api(request)

        self.assertEqual(response.status_code, 201)
        contact = EmergencyContact.objects.get(id=response.data["id"])
        self.assertTrue(contact.is_trusted)

    @patch("dashboard.views._send_sms_via_twilio")
    @patch("django.core.mail.EmailMultiAlternatives")
    def test_sos_notification_sends_email_and_sms_for_trusted_contacts(self, mock_email, mock_sms):
        mock_email.return_value.send.return_value = None
        mock_sms.return_value = None

        contact = EmergencyContact.objects.create(
            user=self.user,
            contact_name="Asha",
            phone_number="9876543210",
            email="asha@example.com",
            relationship="Friend",
            is_trusted=True,
        )

        _send_sos_sms("Emergency", [contact], "Test User", "12.34", "56.78")

        self.assertEqual(mock_email.call_count, 1)
        self.assertEqual(mock_sms.call_count, 1)
