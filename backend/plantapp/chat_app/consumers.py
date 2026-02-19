from channels.generic.websocket import AsyncWebsocketConsumer
import json

class TestConsumer(AsyncWebsocketConsumer):
    async def connect(self):
        # Accept the WebSocket connection
        await self.accept()
        
        # Join the "test_group" - this is the key part!
        await self.channel_layer.group_add(
            "test_group",
            self.channel_name
        )
        
    async def disconnect(self, close_code):
        # Leave the group when disconnecting
        await self.channel_layer.group_discard(
            "test_group",
            self.channel_name
        )
    
    # Handler for the test.event message type
    async def test_event(self, event):
        # Send the message to the WebSocket
        await self.send(text_data=json.dumps({
            'message': event['msg']  # "hello"
        }))