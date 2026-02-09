FROM python:3.12-slim

# Set environment variables
ENV PYTHONUNBUFFERED=1
ENV PYTHONDONTWRITEBYTECODE=1
ENV PIP_NO_CACHE_DIR=1

# Install system dependencies
RUN apt-get update && apt-get install -y \
    gcc \
    libjpeg-dev \
    zlib1g-dev \
    libpq-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

# Set work directory to the Django project
WORKDIR /app/plantapp

# Copy requirements from parent directory
COPY requirements.txt /app/

# Install Python dependencies
RUN pip install --upgrade pip && \
    pip install -r /app/requirements.txt

# Copy the entire backend directory
COPY . /app/

# Run Daphne with auto-reload for development
CMD ["daphne", "-b", "0.0.0.0", "-p", "8000", "--reload", "mysite.asgi:application"]
