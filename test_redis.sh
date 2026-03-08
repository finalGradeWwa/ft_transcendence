#!/bin/bash

# Script to test Redis connection from inside the Docker container

echo "🔍 Testing Redis connection..."
echo "A Redis channel is essentially a medium through which messages are transmitted"
echo ""

docker exec -it ft_transcendence_backend python manage.py test_redis

echo ""
