import json
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from .models import Message, UserProfile

User = get_user_model()


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat messages.
    Each user connects to a personal channel based on their user ID.
    """

    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection.
        """
        self.user = self.scope["user"]
        
        # Reject connection if user is not authenticated
        if not self.user.is_authenticated:
            await self.close()
            return
        
        # Create a personal room for this user
        self.room_name = f"user_{self.user.id}"
        self.room_group_name = f"chat_{self.room_name}"

        # Join room group
        await self.channel_layer.group_add(
            self.room_group_name,
            self.channel_name
        )

        await self.accept()
        
        # Update user's online status
        await self.update_user_status(True)

    async def disconnect(self, close_code):
        """
        Called when the WebSocket closes for any reason.
        """
        if hasattr(self, 'room_group_name'):
            # Leave room group
            await self.channel_layer.group_discard(
                self.room_group_name,
                self.channel_name
            )
        
        # Update user's online status
        if self.user.is_authenticated:
            await self.update_user_status(False)

    async def receive(self, text_data):
        """
        Called when we get a text frame from the client.
        Expected format: {"type": "chat_message", "message": "...", "recipient_username": "..."}
        """
        try:
            data = json.loads(text_data)
            message_type = data.get("type")
            
            if message_type == "chat_message":
                await self.handle_chat_message(data)
            elif message_type == "typing":
                await self.handle_typing_indicator(data)
            elif message_type == "read_receipt":
                await self.handle_read_receipt(data)
            else:
                await self.send(text_data=json.dumps({
                    "error": "Unknown message type"
                }))
        
        except json.JSONDecodeError:
            await self.send(text_data=json.dumps({
                "error": "Invalid JSON"
            }))
        except Exception as e:
            await self.send(text_data=json.dumps({
                "error": str(e)
            }))

    async def handle_chat_message(self, data):
        """
        Handle incoming chat message and save it to database.
        """
        message_content = data.get("message")
        recipient_username = data.get("recipient_username")
        
        if not message_content or not recipient_username:
            await self.send(text_data=json.dumps({
                "error": "Message and recipient_username are required"
            }))
            return
        
        # Save message to database and get recipient
        result = await self.save_message(
            sender=self.user,
            recipient_username=recipient_username,
            content=message_content
        )
        
        if result.get("error"):
            await self.send(text_data=json.dumps({
                "error": result["error"]
            }))
            return
        
        message_data = result["message"]
        recipient_id = result["recipient_id"]
        
        # Send message to recipient's room
        recipient_room_group = f"chat_user_{recipient_id}"
        await self.channel_layer.group_send(
            recipient_room_group,
            {
                "type": "chat_message_handler",
                "message": message_data
            }
        )
        
        # Send confirmation back to sender
        await self.send(text_data=json.dumps({
            "type": "message_sent",
            "message": message_data
        }))

    async def handle_typing_indicator(self, data):
        """
        Handle typing indicator - notify recipient that sender is typing.
        """
        recipient_username = data.get("recipient_username")
        is_typing = data.get("is_typing", True)
        
        if not recipient_username:
            return
        
        recipient = await self.get_user_by_username(recipient_username)
        if not recipient:
            return
        
        recipient_room_group = f"chat_user_{recipient.id}"
        await self.channel_layer.group_send(
            recipient_room_group,
            {
                "type": "typing_indicator_handler",
                "username": self.user.username,
                "is_typing": is_typing
            }
        )

    async def handle_read_receipt(self, data):
        """
        Mark messages as read when user opens conversation.
        """
        sender_username = data.get("sender_username")
        
        if not sender_username:
            return
        
        await self.mark_messages_as_read(
            sender_username=sender_username,
            recipient=self.user
        )
        
        # Notify sender that messages were read
        sender = await self.get_user_by_username(sender_username)
        if sender:
            sender_room_group = f"chat_user_{sender.id}"
            await self.channel_layer.group_send(
                sender_room_group,
                {
                    "type": "read_receipt_handler",
                    "reader_username": self.user.username
                }
            )

    # Handler methods for group_send events
    async def chat_message_handler(self, event):
        """
        Called when a message is sent to this user's group.
        """
        message = event["message"]
        await self.send(text_data=json.dumps({
            "type": "new_message",
            "message": message
        }))

    async def typing_indicator_handler(self, event):
        """
        Called when someone sends a typing indicator.
        """
        await self.send(text_data=json.dumps({
            "type": "typing",
            "username": event["username"],
            "is_typing": event["is_typing"]
        }))

    async def read_receipt_handler(self, event):
        """
        Called when recipient reads messages.
        """
        await self.send(text_data=json.dumps({
            "type": "read_receipt",
            "reader_username": event["reader_username"]
        }))

    # Database operations wrapped with database_sync_to_async
    @database_sync_to_async
    def save_message(self, sender, recipient_username, content):
        """
        Save a new message to the database.
        """
        try:
            recipient = User.objects.get(username=recipient_username)
            message = Message.objects.create(
                sender=sender,
                recipient=recipient,
                content=content
            )
            
            return {
                "message": {
                    "id": message.id,
                    "sender": {
                        "id": sender.id,
                        "username": sender.username
                    },
                    "recipient": {
                        "id": recipient.id,
                        "username": recipient.username
                    },
                    "content": message.content,
                    "timestamp": message.timestamp.isoformat(),
                    "is_read": message.is_read
                },
                "recipient_id": recipient.id
            }
        except User.DoesNotExist:
            return {"error": "Recipient not found"}
        except Exception as e:
            return {"error": str(e)}

    @database_sync_to_async
    def get_user_by_username(self, username):
        """
        Get user by username.
        """
        try:
            return User.objects.get(username=username)
        except User.DoesNotExist:
            return None

    @database_sync_to_async
    def mark_messages_as_read(self, sender_username, recipient):
        """
        Mark all messages from sender to recipient as read.
        """
        try:
            sender = User.objects.get(username=sender_username)
            Message.objects.filter(
                sender=sender,
                recipient=recipient,
                is_read=False
            ).update(is_read=True)
        except User.DoesNotExist:
            pass

    @database_sync_to_async
    def update_user_status(self, is_online):
        """
        Update user's online status.
        """
        try:
            profile, created = UserProfile.objects.get_or_create(user=self.user)
            profile.is_online = is_online
            profile.save()
        except Exception:
            pass
