from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from authentication.models import EmergencyContact


def _send_email(subject, plain_text, html_content, recipients):
    recipients = [email for email in recipients if email]
    if not recipients:
        return 0
    message = EmailMultiAlternatives(
        subject=subject,
        body=plain_text,
        from_email=settings.DEFAULT_FROM_EMAIL,
        to=recipients,
    )
    message.attach_alternative(html_content, "text/html")
    message.send(fail_silently=True)
    return len(recipients)


def send_safety_check_email(journey, check_number):
    """Ask the traveller to confirm they are safe after their expected arrival."""
    if not journey.user or not journey.user.email:
        return 0

    app_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    subject = f"SafeHer check-in {check_number}/3: Are you safe?"
    plain = (
        f"Hi {journey.user.name},\n\n"
        f"Your journey from {journey.source} to {journey.destination} has reached its expected arrival time. "
        "Please open SafeHer and choose 'I'm Safe' or 'I'm still travelling'.\n\n"
        f"Open SafeHer: {app_url}/journey\n\n— SafeHer"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#263246">
      <div style="background:#ff4f81;color:#fff;padding:22px;border-radius:16px 16px 0 0">
        <h1 style="margin:0;font-size:24px">Are you safe?</h1>
      </div>
      <div style="padding:24px;border:1px solid #f4dce5;border-top:0;border-radius:0 0 16px 16px">
        <p>Hi <strong>{journey.user.name}</strong>,</p>
        <p>Your expected arrival time for <strong>{journey.source} → {journey.destination}</strong> has passed.</p>
        <p>Please confirm your status in SafeHer. This is check-in <strong>{check_number} of 3</strong>.</p>
        <a href="{app_url}/journey" style="display:inline-block;background:#ff4f81;color:#fff;padding:12px 18px;border-radius:9px;text-decoration:none;font-weight:bold">Open SafeHer</a>
      </div>
    </div>"""
    return _send_email(subject, plain, html, [journey.user.email])


def send_trusted_contact_escalation(journey):
    """Notify trusted contacts after two unanswered safety-check reminders."""
    contacts = EmergencyContact.objects.filter(user=journey.user, is_trusted=True).exclude(email__isnull=True).exclude(email="")
    app_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    traveller = journey.user.name if journey.user else "A SafeHer user"
    subject = f"Safety alert: {traveller} has not responded"
    plain = (
        f"{traveller} has not responded to two SafeHer safety-check reminders after their expected arrival.\n\n"
        f"Journey: {journey.source} to {journey.destination}\n"
        "Please try to contact them immediately. If you are concerned, call local emergency services (112 in India).\n\n"
        f"SafeHer: {app_url}"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#263246">
      <div style="background:#d92d4c;color:#fff;padding:22px;border-radius:16px 16px 0 0"><h1 style="margin:0;font-size:23px">Safety check alert</h1></div>
      <div style="padding:24px;border:1px solid #f0c8d0;border-top:0;border-radius:0 0 16px 16px">
        <p><strong>{traveller}</strong> has not responded to two safety-check reminders after their expected arrival.</p>
        <p><strong>Journey:</strong> {journey.source} → {journey.destination}</p>
        <p>Please try to contact them immediately. If you are concerned, call local emergency services (112 in India).</p>
        <a href="{app_url}" style="display:inline-block;background:#d92d4c;color:#fff;padding:12px 18px;border-radius:9px;text-decoration:none;font-weight:bold">Open SafeHer</a>
      </div>
    </div>"""
    return _send_email(subject, plain, html, list(contacts.values_list("email", flat=True)))
