#!/bin/sh

set -e

echo "Waiting for database..."

until python -c "
import os
import psycopg

psycopg.connect(
    host=os.getenv('POSTGRES_HOST', 'db'),
    port=os.getenv('POSTGRES_PORT', '5432'),
    dbname=os.getenv('POSTGRES_DB'),
    user=os.getenv('POSTGRES_USER'),
    password=os.getenv('POSTGRES_PASSWORD'),
)
"; do
    sleep 1
done

echo "Database is ready."

echo "Running migrations..."
python manage.py migrate --noinput

echo "Creating superuser if needed..."

python manage.py shell <<'PY'
import os
from django.contrib.auth import get_user_model

User = get_user_model()

username = os.getenv("DJANGO_SUPERUSER_USERNAME")
email = os.getenv("DJANGO_SUPERUSER_EMAIL")
password = os.getenv("DJANGO_SUPERUSER_PASSWORD")

if username and password:
    if not User.objects.filter(username=username).exists():
        User.objects.create_superuser(
            username=username,
            email=email or "",
            password=password,
        )
        print(f"Superuser '{username}' created.")
    else:
        print(f"Superuser '{username}' already exists.")
PY

echo "Starting server..."

exec daphne -b 0.0.0.0 -p 8000 config.asgi:application