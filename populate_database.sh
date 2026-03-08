#!/bin/bash

# Script to populate the database with sample users, gardens, and plants
# This script runs the Django management command inside the Docker container

echo "🌱 Populating database with sample data..."
echo ""

docker exec -it ft_transcendence_backend python manage.py populate_db

echo ""
echo "✅ Done! You can now use the sample users to test your application."
