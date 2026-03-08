#!/bin/bash

# Script to clear stale Redis connection data and reset user online status

echo "🧹 Clearing stale activity status data..."
echo ""

docker exec -it ft_transcendence_backend python manage.py clear_stale_status

echo ""
echo "💡 Tip: Have your users refresh their browser tabs to reconnect and update status."
