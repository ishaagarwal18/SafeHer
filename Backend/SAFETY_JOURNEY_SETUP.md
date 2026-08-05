# Safe Journey monitoring

## How the safety flow works

1. A live Google Maps ETA is saved when a journey starts.
2. At that ETA, SafeHer emails the traveller: **Are you safe?**
3. If there is no answer, it sends two reminders at the configured interval.
4. After two unanswered reminders, SafeHer sends the third prompt and emails every trusted contact with an alert.
5. The traveller can press **I'm Safe** to complete the journey or **I'm still travelling** to reset the timer.

## Required configuration

Set a Google Maps API key with the **Routes API** enabled. This is the only way to make the in-app ETA match Google Maps routing and traffic data.

PowerShell example for the current terminal:

```powershell
$env:GOOGLE_MAPS_API_KEY = "your-key"
$env:FRONTEND_URL = "http://localhost:5173"
$env:SAFETY_CHECK_INTERVAL_MINUTES = "10"
```

Use a public HTTPS frontend URL for `FRONTEND_URL` when testing email on a phone. Never commit an API key.

## Run the monitor

Apply the migration once:

```bat
python manage.py migrate
```

Run this command every minute using Task Scheduler, cron, or a production worker:

```bat
python manage.py monitor_journeys
```

For a quick local demo, run it manually after a journey's ETA has passed. Email sending uses the Django email settings already in `safeher/settings.py`.
