from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
import asyncio

class Command(BaseCommand):
    help = 'Test Redis connection and channel layer configuration'
    def handle(self, *args, **options):
        async def test():
            layer = get_channel_layer()
            self.stdout.write(f"Using: {layer.__class__.__name__}")
            await layer.group_send('test', {'type': 'test'})
            self.stdout.write(self.style.SUCCESS('✓ Redis working!'))
        
        asyncio.run(test())