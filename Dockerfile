FROM python:3.11-slim

# Set environment variables
ENV PYTHONDONTWRITEBYTECODE=1 \
    PYTHONUNBUFFERED=1 \
    # Set fallback for Railway/Fly.io compatibility
    PORT=8080

# Set work directory
WORKDIR /code

# Install system dependencies (split into multiple RUN for better caching)
RUN apt-get update && apt-get install -y --no-install-recommends \
    build-essential \
    libpq-dev \
    postgresql-client \
    && rm -rf /var/lib/apt/lists/*

# Install Python dependencies (cache pip downloads)
COPY requirements.txt .
RUN --mount=type=cache,target=/root/.cache/pip \
    pip install --no-cache-dir -r requirements.txt

# Copy project (exclude unnecessary files with .dockerignore)
COPY . .

# Collect static files (recommended for production)
RUN python manage.py collectstatic --noinput

# Expose port (informational only - Railway/Fly.io ignore this)
EXPOSE $PORT

# Health check (recommended for Railway)
HEALTHCHECK --interval=30s --timeout=30s --start-period=5s --retries=3 \
    CMD curl -f http://localhost:$PORT/health/ || exit 1

# Run migrations and start the application (better error handling)
CMD ["/bin/sh", "-c", "python manage.py migrate && exec gunicorn perfumes_project.wsgi:application --bind 0.0.0.0:$PORT"]