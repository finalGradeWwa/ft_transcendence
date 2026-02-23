
from asgiref.sync import async_to_sync
from channels.db import database_sync_to_async
from channels.routing import URLRouter
from channels.testing import WebsocketCommunicator
from django.contrib.auth.models import AnonymousUser
from django.test import TestCase, TransactionTestCase
from rest_framework.test import APIClient
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
from rest_framework_simplejwt.tokens import AccessToken

from chat_app.middleware import JwtAuthMiddlewareStack
from chat_app.models import Message, UserProfile
from chat_app.routing import websocket_urlpatterns

User = get_user_model()


class MessageModelTestCase(TestCase):

	def setUp(self):
		self.sender = User.objects.create_user(
			username='sender_user',
			email='sender@example.com',
			password='testpass123'
		)
		self.recipient = User.objects.create_user(
			username='recipient_user',
			email='recipient@example.com',
			password='testpass123'
		)

	def test_message_creation(self):
		from chat_app.models import Message
		
		message = Message.objects.create(
			sender=self.sender,
			recipient=self.recipient,
			content='Hello, this is a test message'
		)
		
		self.assertEqual(message.sender, self.sender)
		self.assertEqual(message.recipient, self.recipient)
		self.assertEqual(message.content, 'Hello, this is a test message')
		self.assertFalse(message.is_read)

	def test_message_str_representation(self):
		from chat_app.models import Message
		
		message = Message.objects.create(
			sender=self.sender,
			recipient=self.recipient,
			content='Test message'
		)
		
		expected_str = f"Message from {self.sender.username} to {self.recipient.username}"
		self.assertEqual(str(message), expected_str)

	def test_message_timestamp(self):
		from chat_app.models import Message
		
		before = timezone.now()
		message = Message.objects.create(
			sender=self.sender,
			recipient=self.recipient,
			content='Test'
		)
		after = timezone.now()
		
		self.assertTrue(before <= message.timestamp <= after)

	def test_message_mark_as_read(self):
		from chat_app.models import Message
		
		message = Message.objects.create(
			sender=self.sender,
			recipient=self.recipient,
			content='Test message'
		)
		
		self.assertFalse(message.is_read)
		message.is_read = True
		message.save()
		
		refreshed_message = Message.objects.get(id=message.id)
		self.assertTrue(refreshed_message.is_read)


class UserProfileModelTestCase(TestCase):

	def setUp(self):

		self.user = User.objects.create_user(
			username='testuser',
			email='test@example.com',
			password='testpass123'
		)

	def test_user_profile_creation(self):
		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		
		self.assertEqual(profile.user, self.user)
		self.assertFalse(profile.is_online)

	def test_user_profile_online_status(self):
		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		self.assertFalse(profile.is_online)
		
		profile.is_online = True
		profile.save()
		
		refreshed_profile = UserProfile.objects.get(user=self.user)
		self.assertTrue(refreshed_profile.is_online)

	def test_user_profile_str_representation(self):

		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		expected_str = f"UserProfile of {self.user.username}"
		self.assertEqual(str(profile), expected_str)



class InboxAPIViewTestCase(TestCase):
	"""Test cases for the Inbox API view."""

	def setUp(self):
		self.client = APIClient()
		self.inbox_url = reverse('chat:index')
		self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='testpass123')
		self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='testpass123')
		self.user3 = User.objects.create_user(username='user3', email='user3@example.com', password='testpass123')

	def test_inbox_requires_auth(self):
		response = self.client.get(self.inbox_url)
		self.assertEqual(response.status_code, 401)

	def test_inbox_authenticated(self):
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.inbox_url)
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertIsInstance(data, list)
		self.assertTrue(all('user' in item and 'unread_count' in item for item in data))

	def test_inbox_excludes_current_user(self):
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.inbox_url)
		user_ids = [u['user']['id'] for u in response.json()]
		self.assertNotIn(self.user1.id, user_ids)
		self.assertIn(self.user2.id, user_ids)
		self.assertIn(self.user3.id, user_ids)

	def test_inbox_message_sorting(self):
		from chat_app.models import Message
		# Create messages with different timestamps
		msg1 = Message.objects.create(sender=self.user2, recipient=self.user1, content='First message')
		msg1.timestamp = timezone.now() - timedelta(hours=2)
		msg1.save()
		msg2 = Message.objects.create(sender=self.user3, recipient=self.user1, content='Second message')
		msg2.timestamp = timezone.now() - timedelta(hours=1)
		msg2.save()

		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.inbox_url)
		data = response.json()
		self.assertEqual(data[0]['user']['id'], self.user3.id)
		self.assertEqual(data[1]['user']['id'], self.user2.id)



class ConversationAPIViewTestCase(TestCase):
	"""Test cases for the Conversation API view."""

	def setUp(self):
		self.client = APIClient()
		self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='testpass123')
		self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='testpass123')
		self.chat_url = reverse('chat:chat', args=['user2'])

	def test_conversation_requires_auth(self):
		response = self.client.get(self.chat_url)
		self.assertEqual(response.status_code, 401)

	def test_conversation_authenticated(self):
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.chat_url)
		self.assertEqual(response.status_code, 200)
		data = response.json()
		self.assertIn('other_user', data)
		self.assertIn('messages', data)

	def test_conversation_invalid_user(self):
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(reverse('chat:chat', args=['nonexistent']))
		self.assertEqual(response.status_code, 404)

	def test_conversation_marks_messages_as_read(self):
		from chat_app.models import Message
		message = Message.objects.create(sender=self.user2, recipient=self.user1, content='Test message', is_read=False)
		self.client.force_authenticate(user=self.user1)
		_ = self.client.get(self.chat_url)
		message.refresh_from_db()
		self.assertTrue(message.is_read)

	def test_conversation_message_history(self):
		from chat_app.models import Message
		Message.objects.create(sender=self.user1, recipient=self.user2, content='Hello')
		Message.objects.create(sender=self.user2, recipient=self.user1, content='Hi there')
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.chat_url)
		data = response.json()["messages"]
		self.assertEqual(len(data), 2)
		self.assertEqual(data[0]['content'], 'Hello')
		self.assertEqual(data[1]['content'], 'Hi there')

	def test_send_message_post(self):
		from chat_app.models import Message
		self.client.force_authenticate(user=self.user1)
		response = self.client.post(self.chat_url, {"content": "Hello"}, format='json')
		self.assertEqual(response.status_code, 201)
		payload = response.json()
		self.assertEqual(payload['content'], 'Hello')
		self.assertEqual(payload['sender']['id'], self.user1.id)
		self.assertEqual(payload['recipient']['id'], self.user2.id)
		self.assertTrue(Message.objects.filter(sender=self.user1, recipient=self.user2, content='Hello').exists())


class UserListAPIViewTestCase(TestCase):
	"""Test cases for the User List API view."""

	def setUp(self):
		self.client = APIClient()
		self.user_list_url = reverse('chat:user_list')
		self.user1 = User.objects.create_user(username='user1', email='user1@example.com', password='testpass123')
		self.user2 = User.objects.create_user(username='user2', email='user2@example.com', password='testpass123')
		self.user3 = User.objects.create_user(username='user3', email='user3@example.com', password='testpass123')

	def test_user_list_requires_auth(self):
		response = self.client.get(self.user_list_url)
		self.assertEqual(response.status_code, 401)

	def test_user_list_authenticated(self):
		self.client.force_authenticate(user=self.user1)
		response = self.client.get(self.user_list_url)
		self.assertEqual(response.status_code, 200)
		users = response.json()
		user_ids = [u['id'] for u in users]
		self.assertNotIn(self.user1.id, user_ids)
		self.assertIn(self.user2.id, user_ids)
		self.assertIn(self.user3.id, user_ids)
		self.assertEqual(len(users), 2)


class ChatConsumerWebSocketTestCase(TransactionTestCase):
	def setUp(self):
		self.user1 = User.objects.create_user(username='ws_user1', email='ws_user1@example.com', password='testpass123')
		self.user2 = User.objects.create_user(username='ws_user2', email='ws_user2@example.com', password='testpass123')
		self.application = JwtAuthMiddlewareStack(URLRouter(websocket_urlpatterns))

	def _token(self, user):
		return str(AccessToken.for_user(user))

	def test_websocket_rejects_unauthenticated_connection(self):
		async def scenario():
			communicator = WebsocketCommunicator(self.application, '/ws/chat/')
			connected, _ = await communicator.connect()
			self.assertFalse(connected)

		async_to_sync(scenario)()

	def test_websocket_connect_updates_online_status(self):
		async def scenario():
			communicator = WebsocketCommunicator(self.application, f"/ws/chat/?token={self._token(self.user1)}")
			connected, _ = await communicator.connect()
			self.assertTrue(connected)

			profile = await database_sync_to_async(UserProfile.objects.get)(user=self.user1)
			self.assertTrue(profile.is_online)

			await communicator.disconnect()

			profile = await database_sync_to_async(UserProfile.objects.get)(user=self.user1)
			self.assertFalse(profile.is_online)

		async_to_sync(scenario)()

	def test_chat_message_delivery_and_persistence(self):
		async def scenario():
			sender = WebsocketCommunicator(self.application, f"/ws/chat/?token={self._token(self.user1)}")
			recipient = WebsocketCommunicator(self.application, f"/ws/chat/?token={self._token(self.user2)}")

			sender_connected, _ = await sender.connect()
			recipient_connected, _ = await recipient.connect()
			self.assertTrue(sender_connected)
			self.assertTrue(recipient_connected)

			await sender.send_json_to({
				"type": "chat_message",
				"message": "Hello via websocket",
				"recipient_username": self.user2.username,
			})

			sender_response = await sender.receive_json_from()
			recipient_response = await recipient.receive_json_from()

			self.assertEqual(sender_response["type"], "message_sent")
			self.assertEqual(recipient_response["type"], "new_message")
			self.assertEqual(recipient_response["message"]["content"], "Hello via websocket")

			exists = await database_sync_to_async(Message.objects.filter(
				sender=self.user1,
				recipient=self.user2,
				content="Hello via websocket",
			).exists)()
			self.assertTrue(exists)

			await sender.disconnect()
			await recipient.disconnect()

		async_to_sync(scenario)()

	def test_chat_message_rejects_too_long_content(self):
		async def scenario():
			communicator = WebsocketCommunicator(self.application, f"/ws/chat/?token={self._token(self.user1)}")
			connected, _ = await communicator.connect()
			self.assertTrue(connected)

			await communicator.send_json_to({
				"type": "chat_message",
				"message": "x" * 10001,
				"recipient_username": self.user2.username,
			})

			response = await communicator.receive_json_from()
			self.assertEqual(response["error"], "Message is too long (max 10000 characters)")

			await communicator.disconnect()

		async_to_sync(scenario)()


class JwtAuthMiddlewareTestCase(TransactionTestCase):
	def setUp(self):
		self.user = User.objects.create_user(username='jwt_user', email='jwt_user@example.com', password='testpass123')

	def _run_middleware(self, scope):
		captured = {}

		async def inner(inner_scope, receive, send):
			captured["user"] = inner_scope.get("user")
			await send({"type": "test.complete"})

		middleware = JwtAuthMiddlewareStack(inner)

		async def receive():
			return {"type": "websocket.disconnect"}

		async def send(_message):
			return None

		async def scenario():
			await middleware(scope, receive, send)

		async_to_sync(scenario)()
		return captured.get("user")

	def test_middleware_sets_authenticated_user_from_valid_token(self):
		token = str(AccessToken.for_user(self.user))
		scope = {"type": "websocket", "query_string": f"token={token}".encode(), "user": None}

		user = self._run_middleware(scope)

		self.assertIsNotNone(user)
		self.assertTrue(user.is_authenticated)
		self.assertEqual(user.id, self.user.id)

	def test_middleware_sets_anonymous_user_for_invalid_token(self):
		scope = {"type": "websocket", "query_string": b"token=invalid.token.value", "user": None}

		user = self._run_middleware(scope)

		self.assertIsInstance(user, AnonymousUser)
		self.assertFalse(user.is_authenticated)

	def test_middleware_preserves_existing_authenticated_scope_user(self):
		scope = {
			"type": "websocket",
			"query_string": b"token=invalid.token.value",
			"user": self.user,
		}

		user = self._run_middleware(scope)

		self.assertEqual(user.id, self.user.id)
		self.assertTrue(user.is_authenticated)

