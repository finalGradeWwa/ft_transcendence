from django.core.management.base import BaseCommand
import redis
from django.conf import settings
from users.models import User


class Command(BaseCommand):
    help = 'Clear stale Redis connection counts and reset user online status'

    def handle(self, *args, **options):
        self.stdout.write(self.style.WARNING('Clearing stale Redis data...'))
        
        # Get Redis configuration from channel layer settings
        channel_layers = settings.CHANNEL_LAYERS
        default_layer = channel_layers.get('default', {})
        config = default_layer.get('CONFIG', {})
        hosts = config.get('hosts', [('redis', 6379)])
        
        if hosts:
            host, port = hosts[0] if isinstance(hosts[0], tuple) else ('redis', 6379)
        else:
            host, port = 'redis', 6379
        
        # Connect to Redis
        try:
            r = redis.Redis(host=host, port=port, decode_responses=True)
            r.ping()
            self.stdout.write(self.style.SUCCESS(f'✓ Connected to Redis at {host}:{port}'))
        except Exception as e:
            self.stdout.write(self.style.ERROR(f'✗ Failed to connect to Redis: {e}'))
            return
        
        # Clear all user connection counts
        pattern = 'user_connections:*'
        keys = r.keys(pattern)
        
        if keys:
            deleted = r.delete(*keys)
            self.stdout.write(self.style.SUCCESS(f'✓ Deleted {deleted} stale connection count keys'))
        else:
            self.stdout.write(self.style.WARNING('  No connection count keys found'))
        
        # Reset all users to offline in database
        online_users = User.objects.filter(is_online=True)
        count = online_users.count()
        
        if count > 0:
            online_users.update(is_online=False)
            self.stdout.write(self.style.SUCCESS(f'✓ Set {count} users to offline'))
        else:
            self.stdout.write(self.style.WARNING('  No online users found in database'))
        
        self.stdout.write(self.style.SUCCESS('\n✅ Cleanup complete!'))
        self.stdout.write('Users will be set to online when they next connect via WebSocket.')
