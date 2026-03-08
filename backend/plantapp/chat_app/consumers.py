import json
import logging
import os
import redis.asyncio as redis
from channels.generic.websocket import AsyncWebsocketConsumer
from channels.db import database_sync_to_async
from django.contrib.auth import get_user_model
from django.conf import settings
from .models import Message, UserProfile

User = get_user_model()
MAX_MESSAGE_LENGTH = 10000
logger = logging.getLogger(__name__)


class ChatConsumer(AsyncWebsocketConsumer):
    """
    WebSocket consumer for handling real-time chat messages.
    Each user connects to a personal channel based on their user ID.
    """

    async def connect(self):
        """
        Called when the WebSocket is handshaking as part of initial connection.
        """
        try:
            self.user = self.scope["user"]
            
            logger.info(f"WebSocket connect attempt: user={getattr(self.user, 'username', 'Anonymous')}, authenticated={self.user.is_authenticated}")

            # Reject connection if user is not authenticated
            if not self.user.is_authenticated:
                logger.warning("WebSocket connection rejected: user not authenticated")
                await self.close()
                return

            # Create a personal room for this user
            self.room_name = f"user_{self.user.id}"
            self.room_group_name = f"chat_{self.room_name}"
            logger.info(f"User {self.user.username} joining group: {self.room_group_name}")

            # Join room group
            await self.channel_layer.group_add(
                self.room_group_name,
                self.channel_name
            )
            logger.info(f"User {self.user.username} added to group successfully")

            await self.accept()
            logger.info(f"WebSocket accepted for {self.user.username}")
            logger.info(f"WebSocket connected: user_id={self.user.id}, username={self.user.username}, room_group={self.room_group_name}")

            # Increment connection count and set online status if first connection
            try:
                connection_count = await self.increment_user_connections(self.user.id)
                logger.info(f"User {self.user.username} connection count: {connection_count}")
                if connection_count == 1:
                    # First connection - set user online
                    logger.info(f"Setting user {self.user.username} online (first connection)")
                    await self.set_user_online(True)
                else:
                    logger.info(f"User {self.user.username} already has active connections, not updating status")
            except Exception as e:
                logger.error(f"Error handling connection for user {self.user.username}: {e}", exc_info=True)
        except Exception as e:
            logger.error(f"Fatal error in WebSocket connect: {e}", exc_info=True)
            await self.close()

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

        # Update user's online status if user exists and is authenticated
        if hasattr(self, 'user') and self.user and self.user.is_authenticated:
            logger.info(f"WebSocket disconnected: user_id={self.user.id}, username={self.user.username}, close_code={close_code}")
            # Decrement connection count and set offline only if last connection
            connection_count = await self.decrement_user_connections(self.user.id)
            logger.info(f"User {self.user.username} connection count after disconnect: {connection_count}")
            if connection_count == 0:
                # Last connection closed - set user offline
                logger.info(f"Setting user {self.user.username} offline (last connection closed)")
                await self.set_user_online(False)

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
        except Exception as exc:
            logger.exception(
                "Unexpected error in websocket receive for user_id=%s",
                getattr(self.user, "id", None),
            )
            error_message = str(exc) if settings.DEBUG else "Internal server error"
            await self.send(text_data=json.dumps({
                "error": error_message
            }))

    async def handle_chat_message(self, data):
        """
        Handle incoming chat message and save it to database.
        """
        message_content = data.get("message")
        recipient_username = data.get("recipient_username")

        if not isinstance(message_content, str) or not message_content.strip() or not recipient_username:
            await self.send(text_data=json.dumps({
                "error": "Message and recipient_username are required"
            }))
            return

        if len(message_content) > MAX_MESSAGE_LENGTH:
            await self.send(text_data=json.dumps({
                "error": f"Message is too long (max {MAX_MESSAGE_LENGTH} characters)"
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

    async def status_update_handler(self, event):
        """
        Called when a friend's online status changes.
        """
        logger.info(f"Sending status update to client: user_id={event['user_id']}, is_online={event['is_online']}")
        await self.send(text_data=json.dumps({
            "type": "status_update",
            "user_id": event["user_id"],
            "is_online": event["is_online"]
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
        except Exception as exc:
            logger.exception(
                "Failed to save chat message from sender_id=%s to recipient_username=%s",
                getattr(sender, "id", None),
                recipient_username,
            )
            if settings.DEBUG:
                return {"error": str(exc)}
            return {"error": "Could not send message"}

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
        Update user's online status in User model.
        """
        try:
            logger.info(f"Updating user {self.user.username} status to {'online' if is_online else 'offline'}")
            self.user.is_online = is_online
            self.user.save(update_fields=['is_online'])
            logger.info(f"Successfully updated user {self.user.username} status")
        except Exception as e:
            logger.error(f"Failed to update user status for {self.user.username}: {e}", exc_info=True)

    @database_sync_to_async
    def get_user_online_status(self, user_id):
        """
        Get user's online status from database.
        """
        try:
            user = User.objects.get(id=user_id)
            return user.is_online
        except User.DoesNotExist:
            return False

    async def set_user_online(self, is_online):
        """
        Set user online status and broadcast to all friends.
        """
        # Update database
        await self.update_user_status(is_online)
        # Broadcast status change to all friends
        try:
            await self.broadcast_status_to_friends(is_online)
        except Exception as e:
            logger.error(f"Failed to broadcast status for {self.user.username}: {e}", exc_info=True)

    @database_sync_to_async
    def get_user_friends(self):
        """
        Get all friends of the current user (mutual connections).
        """
        try:
            return list(self.user.get_friends().values_list('id', flat=True))
        except Exception:
            return []

    @database_sync_to_async
    def get_all_connected_users(self):
        """
        Get all users connected to this user:
        - Mutual friends
        - Users who sent friend requests to this user
        - Users this user sent friend requests to
        """
        try:
            user_ids = set()

            # Mutual friends
            mutual_friends = self.user.get_friends().values_list('id', flat=True)
            user_ids.update(mutual_friends)

            # Users who follow this user (sent requests)
            followers = self.user.followers.all().values_list('id', flat=True)
            user_ids.update(followers)

            # Users this user follows (sent requests to)
            following = self.user.following.all().values_list('id', flat=True)
            user_ids.update(following)

            return list(user_ids)
        except Exception:
            return []

    async def broadcast_status_to_friends(self, is_online):
        """
        Broadcast status update to all connected users (friends + pending requests).
        """
        user_ids = await self.get_all_connected_users()
        
        logger.info(f"Broadcasting {self.user.username} status ({'online' if is_online else 'offline'}) to {len(user_ids)} connected users")
        
        for user_id in user_ids:
            # Use same format as connect(): room_group_name = f"chat_user_{user_id}"
            user_room_group = f"chat_user_{user_id}"
            await self.channel_layer.group_send(
                user_room_group,
                {
                    "type": "status_update_handler",
                    "user_id": self.user.id,
                    "is_online": is_online
                }
            )
            logger.debug(f"Sent status update to user {user_id} in group {user_room_group}")

    def get_redis_client(self):
        """
        Get Redis client from channel layer configuration.
        """
        try:
            # Get Redis configuration from Django settings
            channel_layers_config = settings.CHANNEL_LAYERS.get('default', {}).get('CONFIG', {})
            hosts = channel_layers_config.get('hosts', [])
            
            if hosts and isinstance(hosts[0], (tuple, list)) and len(hosts[0]) == 2:
                host, port = hosts[0]
                return redis.Redis(host=host, port=int(port), decode_responses=True)
            
            # Fallback: try to get from environment or use defaults
            host = os.getenv('REDIS_HOST', 'redis')
            port = int(os.getenv('REDIS_PORT', '6379'))
            return redis.Redis(host=host, port=port, decode_responses=True)
        except Exception as e:
            logger.error(f"Error creating Redis client: {e}", exc_info=True)
            # Ultimate fallback
            return redis.Redis(host='redis', port=6379, decode_responses=True)

    async def increment_user_connections(self, user_id):
        """
        Increment the connection count for a user.
        Returns the new count.
        """
        redis_client = self.get_redis_client()
        try:
            key = f"user_connections:{user_id}"
            
            # Check if key exists and validate its value
            existing = await redis_client.get(key)
            if existing is not None:
                try:
                    existing_count = int(existing)
                    
                    # Get user's actual database online status
                    db_is_online = await self.get_user_online_status(user_id)
                    
                    # If user is offline in DB but has Redis connections, reset
                    if not db_is_online and existing_count > 0:
                        logger.warning(f"User {user_id} is offline in DB but has {existing_count} Redis connections, resetting")
                        await redis_client.set(key, 0)
                    # If count is suspiciously high, reset it
                    elif existing_count > 10:
                        logger.warning(f"Resetting suspicious connection count for user {user_id}: {existing_count}")
                        await redis_client.set(key, 0)
                except (ValueError, TypeError):
                    logger.warning(f"Invalid connection count for user {user_id}, resetting")
                    await redis_client.set(key, 0)
            
            count = await redis_client.incr(key)
            # Set expiry to 1 hour (shorter TTL to auto-cleanup stale data)
            await redis_client.expire(key, 3600)
            return count
        finally:
            await redis_client.aclose()

    async def decrement_user_connections(self, user_id):
        """
        Decrement the connection count for a user.
        Returns the new count (minimum 0).
        """
        redis_client = self.get_redis_client()
        try:
            key = f"user_connections:{user_id}"
            count = await redis_client.decr(key)
            if count < 0:
                await redis_client.set(key, 0)
                return 0
            # Refresh expiry on decrement too
            if count > 0:
                await redis_client.expire(key, 3600)
            else:
                # Count reached 0, delete the key to free memory
                await redis_client.delete(key)
            return count
        finally:
            await redis_client.aclose()
