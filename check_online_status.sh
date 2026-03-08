#!/bin/bash

# Script to check online status of all users

echo "📊 Checking user online status..."
echo ""

docker exec -it ft_transcendence_backend python manage.py check_online_status

echo ""
