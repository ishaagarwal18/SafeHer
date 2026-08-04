from datetime import timedelta

from django.conf import settings
from django.core.management.base import BaseCommand
from django.utils import timezone

from journey.models import Journey
from journey.services import send_safety_check_email, send_trusted_contact_escalation


class Command(BaseCommand):
    help = "Send overdue journey safety check-ins and escalate missed responses."

    def handle(self, *args, **options):
        now = timezone.now()
        due_journeys = Journey.objects.filter(
            status="Active",
            next_safety_check_at__isnull=False,
            next_safety_check_at__lte=now,
            escalated_at__isnull=True,
        )
        interval = timedelta(minutes=settings.SAFETY_CHECK_INTERVAL_MINUTES)
        processed = 0

        for journey in due_journeys:
            if not journey.safety_check_pending:
                # First check-in is sent at the Google Maps ETA.
                journey.safety_check_count += 1
                journey.safety_check_pending = True
                journey.last_safety_check_at = now
                journey.next_safety_check_at = now + interval
                journey.save(update_fields=["safety_check_count", "safety_check_pending", "last_safety_check_at", "next_safety_check_at"])
                send_safety_check_email(journey, journey.safety_check_count)
                self.stdout.write(f"Sent safety check 1 for journey {journey.id}.")
            else:
                # The user did not answer the previous prompt. Send up to three prompts;
                # after two missed reminders, alert the trusted contacts immediately.
                journey.missed_check_count += 1
                journey.safety_check_count += 1
                journey.last_safety_check_at = now

                if journey.missed_check_count >= 2:
                    send_safety_check_email(journey, min(journey.safety_check_count, 3))
                    send_trusted_contact_escalation(journey)
                    journey.status = "Safety Alert"
                    journey.escalated_at = now
                    journey.safety_check_pending = False
                    journey.next_safety_check_at = None
                    journey.save(update_fields=["missed_check_count", "safety_check_count", "last_safety_check_at", "status", "escalated_at", "safety_check_pending", "next_safety_check_at"])
                    self.stdout.write(self.style.WARNING(f"Escalated journey {journey.id} to trusted contacts."))
                else:
                    journey.next_safety_check_at = now + interval
                    journey.save(update_fields=["missed_check_count", "safety_check_count", "last_safety_check_at", "next_safety_check_at"])
                    send_safety_check_email(journey, min(journey.safety_check_count, 3))
                    self.stdout.write(f"Sent safety check {journey.safety_check_count} for journey {journey.id}.")
            processed += 1

        self.stdout.write(self.style.SUCCESS(f"Journey monitor finished. Processed {processed} journey(s)."))
