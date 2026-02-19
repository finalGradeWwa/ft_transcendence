from django.core.management.base import BaseCommand
from channels.layers import get_channel_layer
from asgiref.sync import async_to_sync

class Command(BaseCommand):
    """
    Django management command to send a test event through Django Channels.
    
    Purpose:
        This command sends a test message to a WebSocket group to verify that
        the Channels layer is working correctly. Useful for testing WebSocket
        functionality and debugging consumer connections.
    
    Requirements:
        - Django Channels must be installed (pip install channels)
        - A channel layer must be configured in settings.py (e.g., Redis backend)
        - ASGI application must be properly configured
        - At least one consumer must be subscribed to "test_group" to receive the event
    
    Usage:
        python manage.py send_test_event
    
    Expected behavior:
        - Sends a message with type "test.event" and content "hello" to "test_group"
        - Any WebSocket consumer subscribed to "test_group" should receive this event
        - The consumer should have a method like test_event() to handle this message type
    
    Example consumer handler:
        async def test_event(self, event):
            await self.send(text_data=json.dumps({
                'message': event['msg']
            }))
    """
    def handle(self, *args, **kwargs):
        layer = get_channel_layer()
        async_to_sync(layer.group_send)(
            "test_group",
            {"type": "test.event", "msg": "hello"}
        )
        self.stdout.write("Event sent")
