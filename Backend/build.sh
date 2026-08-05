#!/usr/bin/env bash
set -o errexit

pip install -r requirements.txt

python manage.py collectstatic --noinput

python manage.py migrate

# Automatically create admin superusers if environment variables are set
python manage.py create_superusers || true