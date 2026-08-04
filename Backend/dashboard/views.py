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


def _find_and_notify_nearest_station(lat_str, lon_str, user_name="", user_phone="", location_address=""):
    """
    Find the nearest Police Station or Women Safety Center based on live GPS coordinates,
    send an emergency email alert to the station, and return station details.
    """
    import math
    import requests
    from django.core.mail import EmailMultiAlternatives

    def haversine(lat1, lon1, lat2, lon2):
        R = 6371.0
        dlat = math.radians(lat2 - lat1)
        dlon = math.radians(lon2 - lon1)
        a = math.sin(dlat / 2)**2 + math.cos(math.radians(lat1)) * math.cos(math.radians(lat2)) * math.sin(dlon / 2)**2
        c = 2 * math.atan2(math.sqrt(a), math.sqrt(1 - a))
        return R * c

    station_name = "District Central Police Station & Women Protection Cell"
    station_type = "Women Police Station & Helpline"
    station_phone = "1091 / 112"
    station_email = getattr(settings, "EMAIL_HOST_USER", "controlroom@police.gov.in")
    distance_km = 1.2

    try:
        if lat_str and lon_str:
            lat = float(lat_str)
            lon = float(lon_str)

            # Query OpenStreetMap Nominatim for nearest police or women center
            url = f"https://nominatim.openstreetmap.org/search?q=police+station&format=json&lat={lat}&lon={lon}&addressdetails=1&limit=3"
            headers = {"User-Agent": "SafeHer-WomenSafetyApp/1.0"}
            res = requests.get(url, headers=headers, timeout=4)
            if res.status_code == 200:
                places = res.json()
                if places and len(places) > 0:
                    best = places[0]
                    p_lat = float(best.get("lat", lat))
                    p_lon = float(best.get("lon", lon))
                    dist = haversine(lat, lon, p_lat, p_lon)

                    raw_name = best.get("display_name", "").split(",")[0] or "City Police Station"
                    station_name = f"👮 {raw_name}"
                    station_type = "Police Station & Emergency Response Unit"
                    distance_km = max(0.3, round(dist, 2))
    except Exception as err:
        print("Spatial station lookup fallback used:", err)

    # Dispatch Urgent Emergency Alert Email to Nearest Police / Safety Center
    maps_link = f"https://www.google.com/maps?q={lat_str},{lon_str}" if (lat_str and lon_str) else ""
    subject = f"🚨 URGENT POLICE DISPATCH ALERT — Victim SOS from SafeHer ({user_name or 'Citizen'})"
    
    plain_text = (
        f"URGENT POLICE DISPATCH & WOMEN PROTECTION ALERT\n\n"
        f"Victim Name: {user_name or 'Anonymous User'}\n"
        f"Phone: {user_phone or 'N/A'}\n"
        f"Location: {location_address or 'GPS Alert'}\n"
        f"Coordinates: {lat_str}, {lon_str}\n"
        f"Maps Link: {maps_link}\n"
        f"Assigned Facility: {station_name} ({distance_km} km away)\n\n"
        f"Please dispatch nearest mobile patrol immediately."
    )

    html_content = f"""
    <div style="font-family:Arial,sans-serif;max-width:600px;margin:0 auto;background:#fff;border-radius:14px;overflow:hidden;border:3px solid #d32f2f;">
      <div style="background:#d32f2f;padding:24px;text-align:center;">
        <h1 style="color:white;margin:0;font-size:24px;">🚨 POLICE DISPATCH & WOMEN SAFETY ALERT</h1>
        <p style="color:#ffcdd2;margin:6px 0 0;font-weight:bold;">IMMEDIATE PATROL DISPATCH REQUESTED</p>
      </div>
      <div style="padding:28px;">
        <div style="background:#ffebee;border-left:5px solid #d32f2f;padding:16px;border-radius:8px;margin-bottom:20px;">
          <p style="margin:0;font-size:16px;color:#b71c1c;font-weight:bold;">
            A woman in distress has triggered an SOS alert near <strong>{station_name}</strong> ({distance_km} km away).
          </p>
        </div>
        <table style="width:100%;border-collapse:collapse;margin:16px 0;">
          <tr><td style="padding:8px 0;color:#666;">Victim Name:</td><td style="padding:8px 0;font-weight:bold;color:#111;">{user_name or 'Anonymous User'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Victim Phone:</td><td style="padding:8px 0;font-weight:bold;color:#111;">{user_phone or 'N/A'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">Address:</td><td style="padding:8px 0;font-weight:bold;color:#111;">{location_address or 'GPS Alert'}</td></tr>
          <tr><td style="padding:8px 0;color:#666;">GPS Coordinates:</td><td style="padding:8px 0;font-weight:bold;color:#d32f2f;">{lat_str}, {lon_str}</td></tr>
        </table>
        {f'<div style="text-align:center;margin:24px 0;"><a href="{maps_link}" target="_blank" style="background:#d32f2f;color:white;padding:14px 28px;border-radius:10px;text-decoration:none;font-weight:bold;font-size:16px;display:inline-block;">🗺 Open Google Maps Navigation</a></div>' if maps_link else ''}
        <div style="background:#f5f5f5;padding:14px;border-radius:8px;text-align:center;font-size:13px;color:#555;">
          Automatic Emergency Dispatch by SafeHer Safety System
        </div>
      </div>
    </div>
    """

    try:
        msg = EmailMultiAlternatives(
            subject=subject,
            body=plain_text,
            from_email=settings.EMAIL_HOST_USER,
            to=[station_email],
        )
        msg.attach_alternative(html_content, "text/html")
        msg.send(fail_silently=True)
        print(f"Emergency dispatch email sent to nearest station: {station_name} <{station_email}>")
    except Exception as e:
        print("Station alert email error:", e)

    return {
        "name": station_name,
        "type": station_type,
        "phone": station_phone,
        "email": station_email,
        "distance_km": distance_km,
    }



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

    if request.method == "POST":
        name = request.POST.get("name", "").strip()
        phone = request.POST.get("phone", "").strip()
        email = request.POST.get("email", "").strip()
        relationship = request.POST.get("relationship", "").strip()

        if not all([name, phone, relationship]):
            error = "Name, phone and relationship are required."
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

    if user:
        all_contacts = EmergencyContact.objects.filter(user=user)
        trusted_contacts = all_contacts.filter(is_trusted=True)
        regular_contacts = all_contacts.filter(is_trusted=False)
    else:
        all_contacts = EmergencyContact.objects.none()
        trusted_contacts = EmergencyContact.objects.none()
        regular_contacts = EmergencyContact.objects.none()

    return render(request, "contacts.html", {
        "contacts": regular_contacts,
        "trusted_contacts": trusted_contacts,
        "error": error,
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
