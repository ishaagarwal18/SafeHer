from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from .models import SOSAlert
from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from reports.models import UnsafeReport


def _get_current_user(request):
    """Get logged-in user from session or None."""
    user_id = request.session.get("user_id")
    if user_id:
        try:
            return UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            pass
    return None




def _relationship_message(relationship):
    """Return a personalised sender description based on relationship."""
    r = relationship.strip().lower()
    mapping = {
        "father": "Your daughter",
        "mother": "Your daughter",
        "dad": "Your daughter",
        "mom": "Your daughter",
        "mum": "Your daughter",
        "brother": "Your sister",
        "sister": "Your sister",
        "husband": "Your wife",
        "wife": "Your husband",
        "boyfriend": "Your girlfriend",
        "girlfriend": "Your boyfriend",
        "friend": "Your friend",
        "best friend": "Your best friend",
        "uncle": "Your niece",
        "aunt": "Your niece",
        "grandfather": "Your granddaughter",
        "grandpa": "Your granddaughter",
        "grandmother": "Your granddaughter",
        "grandma": "Your granddaughter",
        "son": "Your mother",
        "daughter": "Your mother",
        "colleague": "Your colleague",
        "roommate": "Your roommate",
        "neighbour": "Your neighbour",
        "neighbor": "Your neighbour",
        "teacher": "Your student",
        "guardian": "Your ward",
    }
    return mapping.get(r, "Someone you know")


def _send_twilio_sms(trusted_contacts, user_name="", location="", latitude="", longitude=""):
    """Send a real SMS via Twilio to every trusted contact that has a phone number."""
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_PHONE_NUMBER

    if not all([account_sid, auth_token, from_number]):
        print("Twilio credentials not configured — SMS skipped.")
        return

    try:
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException
    except ImportError:
        print("twilio package not installed — run: pip install twilio")
        return

    client = Client(account_sid, auth_token)

    maps_link = (
        f"https://www.google.com/maps?q={latitude},{longitude}"
        if latitude and longitude
        else ""
    )

    for contact in trusted_contacts:
        raw_phone = (contact.phone_number or "").strip()
        if not raw_phone:
            print(f"No phone number for {contact.contact_name} — SMS skipped")
            continue

        # Normalise to E.164 format if not already prefixed
        if not raw_phone.startswith("+"):
            # Default to Indian numbers (+91) — change prefix as needed
            raw_phone = "+91" + raw_phone.lstrip("0")

        name_part = f" ({user_name})" if user_name else ""
        body = (
            f"🚨 SOS ALERT — {contact.contact_name}, "
            f"someone close to you{name_part} needs immediate help!\n"
            f"📍 Location: {location or 'Unknown'}"
        )
        if maps_link:
            body += f"\n🗺 Maps: {maps_link}"
        body += "\nPlease reach out or call 112 immediately."

        try:
            message = client.messages.create(
                body=body,
                from_=from_number,
                to=raw_phone,
            )
            print(f"SMS sent to {contact.contact_name} ({raw_phone}): SID={message.sid}")
        except TwilioRestException as e:
            print(f"Twilio error for {contact.contact_name} ({raw_phone}): {e}")
        except Exception as e:
            print(f"Unexpected SMS error for {contact.contact_name}: {e}")


_send_sms_via_twilio = _send_twilio_sms


def _send_sos_sms(location, trusted_contacts, user_name="", latitude="", longitude=""):
    """Send SOS alert HTML email to all trusted contacts that have an email address."""
    from django.core.mail import EmailMultiAlternatives

    maps_link = ""
    static_map_img = ""
    if latitude and longitude:
        try:
            lat_f = float(latitude)
            lon_f = float(longitude)
            maps_link = f"https://www.google.com/maps?q={lat_f},{lon_f}"
            static_map_img = (
                f"https://static-maps.yandex.ru/1.x/?lang=en_US&ll={lon_f},{lat_f}&z=16&l=map&size=600,280&pt={lon_f},{lat_f},pm2rdl"
            )
        except (ValueError, TypeError):
            maps_link = ""
            static_map_img = ""


    for contact in trusted_contacts:
        if not contact.email:
            print(f"No email for trusted contact {contact.contact_name} ({contact.phone_number}) — skipped")
            continue

        sender_desc = _relationship_message(contact.relationship)
        name_part = f" ({user_name})" if user_name else ""
        subject = f"🚨 URGENT SOS ALERT — {sender_desc}{name_part} needs help!"

        # Plain text fallback
        plain_text = (
            f"Dear {contact.contact_name},\n\n"
            f"🚨 EMERGENCY ALERT\n\n"
            f"{sender_desc}{name_part} has triggered an SOS alert and needs immediate help!\n\n"
            f"📍 Last Known Location:\n{location or 'Location not available'}\n\n"
        )
        if maps_link:
            plain_text += f"🗺 Open on Google Maps:\n{maps_link}\n\n"
        plain_text += "Please contact them immediately or call emergency services (112).\n\n— SafeHer Safety App"

        # HTML email with map link
        map_section = ""
        if maps_link:
            map_section = f"""
            <div style="margin:20px 0;text-align:center;">
              <a href="{maps_link}" target="_blank"
                 style="display:inline-block;background:#e53935;color:white;padding:14px 28px;
                        border-radius:8px;text-decoration:none;font-size:16px;font-weight:bold;">
                🗺 View Live Location on Google Maps
              </a>
            </div>
            <div style="margin:16px 0;border-radius:12px;overflow:hidden;border:2px solid #e53935;">
              <img src="https://static-maps.yandex.ru/1.x/?lang=en_US&ll={longitude},{latitude}&z=16&l=map&size=600,280&pt={longitude},{latitude},pm2rdl"
                   alt="Location Map"
                   style="width:100%;display:block;"
                   onerror="this.style.display='none'">
            </div>
            """

        html_content = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="background:#e53935;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:26px;">🚨 SOS EMERGENCY ALERT</h1>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;color:#333;">Dear <strong>{contact.contact_name}</strong>,</p>
            <div style="background:#fff3e0;border-left:4px solid #e53935;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0;font-size:17px;color:#b71c1c;font-weight:bold;">
                {sender_desc}{name_part} has triggered an SOS alert and needs immediate help!
              </p>
            </div>
            <div style="background:#f5f5f5;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:13px;color:#888;text-transform:uppercase;letter-spacing:1px;">📍 Last Known Location</p>
              <p style="margin:0;font-size:15px;color:#333;font-weight:600;">{location or 'Location not available'}</p>
            </div>
            {map_section}
            <div style="background:#ffebee;border-radius:8px;padding:16px;margin:16px 0;text-align:center;">
              <p style="margin:0;font-size:15px;color:#c62828;font-weight:bold;">
                Please contact them immediately or call <span style="font-size:18px;">112</span>
              </p>
            </div>
            <p style="color:#999;font-size:12px;text-align:center;margin-top:24px;">Sent by SafeHer Safety App</p>
          </div>
        </div>
        """

        try:
            from_addr = getattr(settings, "EMAIL_HOST_USER", None) or getattr(settings, "DEFAULT_FROM_EMAIL", "noreply@safeher.com")
            sender_email = f"SafeHer Emergency Console <{from_addr}>"
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=sender_email,
                to=[contact.email],
                headers={"X-Priority": "1", "Priority": "urgent", "Importance": "High"},
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=False)
            print(f"SOS email sent successfully to {contact.contact_name} <{contact.email}>")
        except Exception as e:
            print(f"SOS email error for {contact.contact_name}: {e}")

    # Also send SMS to ALL trusted contacts (including those without email)
    _send_sms_via_twilio(trusted_contacts, user_name, location, latitude, longitude)


_send_sos_email = _send_sos_sms
_send_sms_via_twilio = _send_twilio_sms



def _send_safe_email(trusted_contacts, user_name="", duration_str="", location=""):
    """Send an HTML email notification to trusted contacts when the user marks themselves as safe."""
    from django.core.mail import EmailMultiAlternatives

    for contact in trusted_contacts:
        if not contact.email:
            print(f"No email for trusted contact {contact.contact_name} — skipped safe notification")
            continue

        sender_desc = _relationship_message(contact.relationship)
        name_part = f" ({user_name})" if user_name else ""
        subject = f"✅ SAFE CONFIRMATION — {sender_desc}{name_part} is Safe!"

        plain_text = (
            f"Dear {contact.contact_name},\n\n"
            f"✅ SAFE CONFIRMATION\n\n"
            f"{sender_desc}{name_part} has marked themselves as SAFE and the emergency session has been resolved.\n\n"
            f"⏱ Emergency Duration: {duration_str}\n"
            f"📍 Last Known Location:\n{location or 'Location not specified'}\n\n"
            f"Thank you for keeping watch over them!\n\n— SafeHer Safety App"
        )

        html_content = f"""
        <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:12px;overflow:hidden;box-shadow:0 4px 20px rgba(0,0,0,0.1);">
          <div style="background:#10b981;padding:24px;text-align:center;">
            <h1 style="color:white;margin:0;font-size:26px;">✅ USER IS SAFE NOW</h1>
          </div>
          <div style="padding:28px;">
            <p style="font-size:16px;color:#333;">Dear <strong>{contact.contact_name}</strong>,</p>
            <div style="background:#ecfdf5;border-left:4px solid #10b981;padding:16px;border-radius:8px;margin:16px 0;">
              <p style="margin:0;font-size:17px;color:#047857;font-weight:bold;">
                {sender_desc}{name_part} has marked themselves as SAFE!
              </p>
            </div>
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">⏱ Emergency Duration</p>
              <p style="margin:0;font-size:16px;color:#1e293b;font-weight:bold;">{duration_str}</p>
            </div>
            <div style="background:#f8fafc;border-radius:8px;padding:16px;margin:16px 0;">
              <p style="margin:0 0 6px;font-size:13px;color:#64748b;text-transform:uppercase;letter-spacing:1px;">📍 Last Known Location</p>
              <p style="margin:0;font-size:15px;color:#333;font-weight:600;">{location or 'Location not specified'}</p>
            </div>
            <p style="color:#64748b;font-size:14px;text-align:center;margin-top:20px;">
              Live emergency tracking and media recording have ended.
            </p>
            <p style="color:#94a3b8;font-size:12px;text-align:center;margin-top:24px;">Sent by SafeHer Safety App</p>
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
            msg.send(fail_silently=False)
            print(f"Safe confirmation email sent successfully to {contact.contact_name} <{contact.email}>")
        except Exception as e:
            print(f"Safe email error for {contact.contact_name}: {e}")



    # Also send "safe" SMS to all trusted contacts
    _send_safe_sms(trusted_contacts, user_name, location)


def _send_safe_sms(trusted_contacts, user_name="", location=""):
    """Send a brief SMS to trusted contacts confirming the user is safe."""
    account_sid = settings.TWILIO_ACCOUNT_SID
    auth_token = settings.TWILIO_AUTH_TOKEN
    from_number = settings.TWILIO_PHONE_NUMBER

    if not all([account_sid, auth_token, from_number]):
        print("Twilio credentials not configured — safe SMS skipped.")
        return

    try:
        from twilio.rest import Client
        from twilio.base.exceptions import TwilioRestException
    except ImportError:
        print("twilio package not installed — run: pip install twilio")
        return

    client = Client(account_sid, auth_token)

    for contact in trusted_contacts:
        raw_phone = (contact.phone_number or "").strip()
        if not raw_phone:
            continue

        if not raw_phone.startswith("+"):
            raw_phone = "+91" + raw_phone.lstrip("0")

        name_part = f" ({user_name})" if user_name else ""
        body = (
            f"✅ SAFE CONFIRMATION — {contact.contact_name}, "
            f"the person{name_part} has marked themselves SAFE. "
            f"Emergency resolved. — SafeHer"
        )

        try:
            message = client.messages.create(body=body, from_=from_number, to=raw_phone)
            print(f"Safe SMS sent to {contact.contact_name} ({raw_phone}): SID={message.sid}")
        except TwilioRestException as e:
            print(f"Twilio error (safe) for {contact.contact_name} ({raw_phone}): {e}")
        except Exception as e:
            print(f"Unexpected safe SMS error for {contact.contact_name}: {e}")


def add_trusted_contact(request):

    if request.method == "POST":
        contact_id = request.POST.get("contact_id")
        contact = get_object_or_404(EmergencyContact, id=contact_id)
        contact.is_trusted = True
        contact.save()
    return redirect("/dashboard/contacts/")


def remove_trusted_contact(request):
    if request.method == "POST":
        contact_id = request.POST.get("contact_id")
        contact = get_object_or_404(EmergencyContact, id=contact_id)
        contact.is_trusted = False
        contact.save()
    return redirect("/dashboard/contacts/")


def delete_contact(request):
    if request.method == "POST":
        contact_id = request.POST.get("contact_id")
        contact = get_object_or_404(EmergencyContact, id=contact_id)
        contact.delete()
    return redirect("/dashboard/contacts/")


def _login_required(request):
    """Return the logged-in UserProfile or None. None means redirect to login."""
    user_id = request.session.get("user_id")
    if not user_id:
        return None
    try:
        return UserProfile.objects.get(id=user_id)
    except UserProfile.DoesNotExist:
        return None


def dashboard_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/")

    journey_count = Journey.objects.filter(user=user).count()
    contact_count = EmergencyContact.objects.filter(user=user).count()
    sos_count = SOSAlert.objects.count()
    trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True)
    return render(request, "dashboard.html", {
        "journey_count": journey_count,
        "contact_count": contact_count,
        "sos_count": sos_count,
        "contact": trusted_contacts,
        "user": user,
    })


def sos_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/sos/")

    if request.method == "POST":
        location = request.POST.get("location", "")
        latitude = request.POST.get("latitude", "")
        longitude = request.POST.get("longitude", "")
        SOSAlert.objects.create(
            status="Sent",
            location=location,
            latitude=latitude,
            longitude=longitude,
        )
        trusted_contacts = EmergencyContact.objects.filter(user=user, is_trusted=True)
        _send_sos_sms(location, trusted_contacts, user.name, latitude, longitude)

    alerts = SOSAlert.objects.all().order_by("-id")
    return render(request, "sos.html", {"alerts": alerts, "user": user})


def contacts_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/contacts/")

    error = None
    success = None

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        phone = request.POST.get("phone", "").strip()
        email = request.POST.get("email", "").strip()
        relationship = request.POST.get("relationship", "").strip()

        if not all([name, phone, relationship]):
            error = "Name, phone and relationship are required."
        elif not phone.isdigit() or len(phone) != 10:
            error = "Phone number must be exactly 10 digits."
        elif email and "@" not in email:
            error = "Please enter a valid email address."
        else:
            EmergencyContact.objects.create(
                user=user,
                contact_name=name,
                phone_number=phone,
                email=email or None,
                relationship=relationship,
            )
            success = f"{name} added successfully."

    all_contacts = EmergencyContact.objects.filter(user=user)
    trusted_contacts = all_contacts.filter(is_trusted=True)
    regular_contacts = all_contacts.filter(is_trusted=False)

    return render(request, "contacts.html", {
        "contacts": regular_contacts,
        "trusted_contacts": trusted_contacts,
        "error": error,
        "success": success,
        "user": user,
    })


def journey_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/journey/")

    unsafe_warning = None

    if request.method == "POST":
        source = request.POST.get("source", "").strip()
        destination = request.POST.get("destination", "").strip()
        transport = request.POST.get("transport", "").strip()
        force = request.POST.get("force_proceed", "")

        # Check if source or destination matches any reported unsafe area
        if not force:
            unsafe_areas = UnsafeReport.objects.values_list("area_name", flat=True)
            for area in unsafe_areas:
                area_lower = area.lower()
                if area_lower in source.lower() or area_lower in destination.lower():
                    unsafe_warning = f"⚠️ Warning: '{area}' has been reported as an unsafe area. Please stay safe!"
                    break

        if not unsafe_warning:
            Journey.objects.create(
                source=source,
                destination=destination,
                transport_mode=transport,
            )
            return redirect("/dashboard/journey/")

    journeys = Journey.objects.all().order_by("-start_time")
    return render(request, "start_journey.html", {
        "journeys": journeys,
        "unsafe_warning": unsafe_warning,
    })


def places_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/places/")
    return render(request, 'safe_places.html', {"user": user})


def reports_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/reports/")

    if request.method == "POST":
        UnsafeReport.objects.create(
            area_name=request.POST.get("area", ""),
            issue_type=request.POST.get("issue", ""),
            description=request.POST.get("description", ""),
        )
    reports = UnsafeReport.objects.all().order_by("-id")
    return render(request, 'report.html', {"reports": reports, "user": user})


def history_page(request):
    user = _login_required(request)
    if not user:
        return redirect("/login/?next=/dashboard/history/")
    return render(request, 'journey_status.html', {"user": user})
