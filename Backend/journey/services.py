from django.conf import settings
from django.core.mail import EmailMultiAlternatives

from authentication.models import EmergencyContact


def _send_email(subject, plain_text, html_content, recipients):
    recipients = [email for email in recipients if email]
    if not recipients:
        return 0
    from_email = getattr(settings, "EMAIL_HOST_USER", None) or getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@safeher.com")
    if not from_email or "your-email" in from_email:
        from_email = "noreply@safeher.com"
    message = EmailMultiAlternatives(
        subject=subject,
        body=plain_text,
        from_email=from_email,
        to=recipients,
    )
    message.attach_alternative(html_content, "text/html")
    safe_subj = subject.encode('ascii', 'replace').decode('ascii')
    try:
        message.send(fail_silently=False)
        print(f"[EMAIL SENT] Subject: '{safe_subj}' to {recipients}")
        return len(recipients)
    except Exception as e:
        safe_err = str(e).encode('ascii', 'replace').decode('ascii')
        print(f"[EMAIL ERROR] Subject: '{safe_subj}' to {recipients}: {safe_err}")
        return 0


def send_safety_check_email(journey):
    """Send an HTML safety check-in email to the user asking 'Are you safe or not?' with direct interactive links."""
    if not journey.user or not journey.user.email:
        return 0

    app_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    user_name = journey.user.name if (journey.user and journey.user.name) else "Traveller"

    # Interactive action links
    safe_action_url = f"{app_url}/journey?checkin={journey.id}&status=safe"
    not_safe_action_url = f"{app_url}/journey?checkin={journey.id}&status=not_safe"

    subject = f"[SafeHer Safety Check] Are you safe?"

    plain = (
        f"Hi {user_name},\n\n"
        f"Periodic safety check for your active journey: {journey.source} -> {journey.destination}.\n\n"
        f"Are you safe?\n\n"
        f"YES, I am safe: {safe_action_url}\n"
        f"NO, I am NOT safe: {not_safe_action_url}\n\n"
        f"- SafeHer Safety App"
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);border:1px solid #f4dce5;">
      <div style="background:#ff4f81;color:#fff;padding:22px;text-align:center;">
        <h1 style="margin:0;font-size:24px;">SafeHer Safety Check</h1>
      </div>
      <div style="padding:26px;text-align:center;">
        <p style="font-size:16px;color:#333;margin:0 0 12px;">Hi <strong>{user_name}</strong>,</p>
        <p style="font-size:15px;color:#526074;margin:0 0 20px;">
          Periodic safety check for your active journey:<br/>
          <strong style="color:#1e293b;font-size:16px;">{journey.source} -> {journey.destination}</strong>
        </p>

        <div style="background:#fff5f8;border-radius:12px;padding:20px;margin:20px 0;border:1px solid #ffe0ea;">
          <h2 style="margin:0 0 16px;color:#e93870;font-size:20px;">Are you safe or not?</h2>

          <div style="display:inline-block;margin:6px;">
            <a href="{safe_action_url}" target="_blank"
               style="display:inline-block;background:#10b981;color:white;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;">
              I'm Safe
            </a>
          </div>
          <div style="display:inline-block;margin:6px;">
            <a href="{not_safe_action_url}" target="_blank"
               style="display:inline-block;background:#dc2626;color:white;padding:12px 24px;
                      border-radius:8px;text-decoration:none;font-size:15px;font-weight:bold;">
              Not Safe
            </a>
          </div>
        </div>

        <p style="color:#94a3b8;font-size:12px;margin-top:20px;">
          Clicking "Not Safe" will immediately send an emergency alert email to all your trusted contacts.
        </p>
      </div>
    </div>
    """
    return _send_email(subject, plain, html, [journey.user.email])


def send_not_safe_alert_email(journey, location=""):
    """Send an URGENT emergency email to all trusted contacts when user marks NOT SAFE."""
    contacts = EmergencyContact.objects.filter(is_trusted=True).exclude(email__isnull=True).exclude(email="")
    if journey.user:
        user_contacts = EmergencyContact.objects.filter(user=journey.user, is_trusted=True).exclude(email__isnull=True).exclude(email="")
        if user_contacts.exists():
            contacts = user_contacts

    app_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    traveller = journey.user.name if (journey.user and journey.user.name) else "SafeHer User"
    maps_link = f"https://www.google.com/maps/dir/?api=1&origin={journey.source}&destination={journey.destination}"
    subject = f"[URGENT SAFETY ALERT] {traveller} reported NOT SAFE during journey!"

    plain = (
        f"URGENT EMERGENCY ALERT\n\n"
        f"{traveller} has explicitly clicked 'NOT SAFE' during their journey from {journey.source} to {journey.destination}!\n\n"
        f"Location / Route: {journey.source} -> {journey.destination}\n"
        f"Google Maps Link: {maps_link}\n\n"
        "Please try to contact them immediately or call emergency services (112).\n\n"
        f"- SafeHer Safety App\n{app_url}"
    )

    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.15);">
      <div style="background:#dc2626;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:26px;">URGENT: USER REPORTED NOT SAFE</h1>
      </div>
      <div style="padding:28px;">
        <p style="font-size:16px;color:#333;">Dear Trusted Contact,</p>
        <div style="background:#fef2f2;border-left:4px solid #dc2626;padding:16px;border-radius:8px;margin:16px 0;">
          <p style="margin:0;font-size:17px;color:#991b1b;font-weight:bold;">
            {traveller} has triggered a NOT SAFE alert during their active journey!
          </p>
        </div>
        <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
          <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">Active Route</p>
          <p style="margin:0;font-size:15px;color:#1e293b;font-weight:bold;">{journey.source} -> {journey.destination}</p>
          <p style="margin:4px 0 0;font-size:13px;color:#64748b;">Transport Mode: {journey.transport_mode or 'Car'}</p>
        </div>
        <div style="margin:20px 0;text-align:center;">
          <a href="{maps_link}" target="_blank"
             style="display:inline-block;background:#dc2626;color:white;padding:14px 28px;
                    border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
            View Route on Google Maps
          </a>
        </div>
        <div style="background:#fee2e2;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
          <p style="margin:0;font-size:15px;color:#991b1b;font-weight:bold;">
            Please contact them immediately or call Emergency Services (<span style="font-size:18px;">112</span>)
          </p>
        </div>
        <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;">Sent by SafeHer Safety App</p>
      </div>
    </div>
    """
    recipients = list(contacts.values_list("email", flat=True))
    return _send_email(subject, plain, html, recipients)


def send_trusted_contact_escalation(journey):
    """Notify trusted contacts after two ignored/unanswered safety-check prompts."""
    contacts = EmergencyContact.objects.filter(is_trusted=True).exclude(email__isnull=True).exclude(email="")
    if journey.user:
        user_contacts = EmergencyContact.objects.filter(user=journey.user, is_trusted=True).exclude(email__isnull=True).exclude(email="")
        if user_contacts.exists():
            contacts = user_contacts

    app_url = getattr(settings, "FRONTEND_URL", "http://localhost:5173")
    traveller = journey.user.name if (journey.user and journey.user.name) else "SafeHer User"
    subject = f"[UNANSWERED SAFETY ALERT] {traveller} ignored 2 safety check-ins!"
    plain = (
        f"⚠️ AUTOMATED SAFETY ESCALATION ALERT\n\n"
        f"{traveller} has ignored 2 consecutive safety check-in prompts during their journey from {journey.source} to {journey.destination}.\n\n"
        f"Journey Route: {journey.source} → {journey.destination}\n"
        "Please try to contact them immediately. If you are concerned, call emergency services (112).\n\n"
        f"SafeHer: {app_url}"
    )
    html = f"""
    <div style="font-family:Arial,sans-serif;max-width:560px;margin:auto;color:#263246">
      <div style="background:#d92d4c;color:#fff;padding:22px;border-radius:16px 16px 0 0">
        <h1 style="margin:0;font-size:23px">⚠️ Safety Check Escalation Alert</h1>
      </div>
      <div style="padding:24px;border:1px solid #f0c8d0;border-top:0;border-radius:0 0 16px 16px">
        <p><strong>{traveller}</strong> has ignored <strong>2 consecutive safety check-in prompts</strong> during their journey.</p>
        <p><strong>Route:</strong> {journey.source} → {journey.destination}</p>
        <p>Please attempt to contact them immediately. If there is no response, contact emergency services (112).</p>
        <a href="{app_url}" style="display:inline-block;background:#d92d4c;color:#fff;padding:12px 18px;border-radius:9px;text-decoration:none;font-weight:bold">Open SafeHer</a>
      </div>
    </div>"""
    return _send_email(subject, plain, html, list(contacts.values_list("email", flat=True)))
