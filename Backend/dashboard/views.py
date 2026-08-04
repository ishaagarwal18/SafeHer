from django.shortcuts import render, redirect, get_object_or_404
from django.conf import settings
from .models import SOSAlert
from journey.models import Journey
from authentication.models import EmergencyContact, UserProfile
from reports.models import UnsafeReport


def _get_current_user(request):
    """Get logged-in user from session, fallback to first user for dev."""
    user_id = request.session.get("user_id")
    if user_id:
        try:
            return UserProfile.objects.get(id=user_id)
        except UserProfile.DoesNotExist:
            pass
    return UserProfile.objects.first()


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


def _send_sos_sms(location, trusted_contacts, user_name="", latitude="", longitude=""):
    """Send SOS alert HTML email to all trusted contacts that have an email address."""
    from django.core.mail import EmailMultiAlternatives

    maps_link = ""
    static_map_img = ""
    if latitude and longitude:
        maps_link = f"https://www.google.com/maps?q={latitude},{longitude}"
        static_map_img = (
            f"https://maps.googleapis.com/maps/api/staticmap"
            f"?center={latitude},{longitude}&zoom=17&size=600x300"
            f"&markers=color:red%7C{latitude},{longitude}&key=YOUR_GOOGLE_MAPS_API_KEY"
        )
        # Use OpenStreetMap static map as fallback (no API key needed)
        osm_map = (
            f"https://www.openstreetmap.org/export/embed.html"
            f"?bbox={float(longitude)-0.005},{float(latitude)-0.005},{float(longitude)+0.005},{float(latitude)+0.005}"
            f"&layer=mapnik&marker={latitude},{longitude}"
        )

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
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=settings.EMAIL_HOST_USER,
                to=[contact.email],
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=True)
            print(f"SOS email sent to {contact.contact_name} <{contact.email}>")
        except Exception as e:
            print(f"SOS email error for {contact.contact_name}: {e}")


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
            msg = EmailMultiAlternatives(
                subject=subject,
                body=plain_text,
                from_email=settings.EMAIL_HOST_USER,
                to=[contact.email],
            )
            msg.attach_alternative(html_content, "text/html")
            msg.send(fail_silently=True)
            print(f"Safe email sent to {contact.contact_name} <{contact.email}>")
        except Exception as e:
            print(f"Safe email error for {contact.contact_name}: {e}")


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


def dashboard_page(request):
    journey_count = Journey.objects.count()
    contact_count = EmergencyContact.objects.count()
    sos_count = SOSAlert.objects.count()
    trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)
    return render(request, "dashboard.html", {
        "journey_count": journey_count,
        "contact_count": contact_count,
        "sos_count": sos_count,
        "contact": trusted_contacts,
    })


def sos_page(request):
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
        # Send email to all trusted contacts
        trusted_contacts = EmergencyContact.objects.filter(is_trusted=True)
        user = _get_current_user(request)
        user_name = user.name if user else ""
        _send_sos_sms(location, trusted_contacts, user_name, latitude, longitude)

    alerts = SOSAlert.objects.all().order_by("-id")
    return render(request, "sos.html", {"alerts": alerts})


def contacts_page(request):
    user = _get_current_user(request)
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
        elif user is None:
            error = "No user account found. Please register first."
        else:
            EmergencyContact.objects.create(
                user=user,
                contact_name=name,
                phone_number=phone,
                email=email or None,
                relationship=relationship,
            )
            success = f"{name} added successfully."

    if user:
        all_contacts = EmergencyContact.objects.filter(user=user)
        trusted_contacts = all_contacts.filter(is_trusted=True)
        regular_contacts = all_contacts.filter(is_trusted=False)
    else:
        trusted_contacts = EmergencyContact.objects.none()
        regular_contacts = EmergencyContact.objects.none()

    return render(request, "contacts.html", {
        "contacts": regular_contacts,
        "trusted_contacts": trusted_contacts,
        "error": error,
        "success": success,
    })


def journey_page(request):
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
    return render(request, 'safe_places.html')


def reports_page(request):
    if request.method == "POST":
        UnsafeReport.objects.create(
            area_name=request.POST.get("area", ""),
            issue_type=request.POST.get("issue", ""),
            description=request.POST.get("description", ""),
        )
    reports = UnsafeReport.objects.all().order_by("-id")
    return render(request, 'report.html', {"reports": reports})


def history_page(request):
    return render(request, 'journey_status.html')
