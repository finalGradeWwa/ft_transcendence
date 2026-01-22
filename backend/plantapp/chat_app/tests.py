"""
Test suite for the chat_app application.
Tests cover models, views, and WebSocket functionality.
"""
from django.test import TestCase, Client
from django.contrib.auth import get_user_model
from django.urls import reverse
from django.utils import timezone
from datetime import timedelta
import json

User = get_user_model()


class MessageModelTestCase(TestCase):
	"""Test cases for the Message model."""

	def setUp(self):
		"""Set up test users for message testing."""
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
		"""Test creating a message between two users."""
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
		"""Test the string representation of a message."""
		from chat_app.models import Message
		
		message = Message.objects.create(
			sender=self.sender,
			recipient=self.recipient,
			content='Test message'
		)
		
		expected_str = f"Message from {self.sender.username} to {self.recipient.username}"
		self.assertEqual(str(message), expected_str)

	def test_message_timestamp(self):
		"""Test that message timestamp is automatically set."""
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
		"""Test marking a message as read."""
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
	"""Test cases for the UserProfile model."""

	def setUp(self):
		"""Set up test user."""
		self.user = User.objects.create_user(
			username='testuser',
			email='test@example.com',
			password='testpass123'
		)

	def test_user_profile_creation(self):
		"""Test creating a user profile."""
		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		
		self.assertEqual(profile.user, self.user)
		self.assertFalse(profile.is_online)

	def test_user_profile_online_status(self):
		"""Test updating user online status."""
		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		self.assertFalse(profile.is_online)
		
		profile.is_online = True
		profile.save()
		
		refreshed_profile = UserProfile.objects.get(user=self.user)
		self.assertTrue(refreshed_profile.is_online)

	def test_user_profile_str_representation(self):
		"""Test the string representation of a user profile."""
		from chat_app.models import UserProfile
		
		profile = UserProfile.objects.create(user=self.user)
		expected_str = f"UserProfile of {self.user.username}"
		self.assertEqual(str(profile), expected_str)


class RegisterViewTestCase(TestCase):
	"""Test cases for the RegisterView."""

	def setUp(self):
		"""Set up test client."""
		self.client = Client()
		self.register_url = reverse('chat:register')

	def test_register_get_request(self):
		"""Test GET request to register page."""
		response = self.client.get(self.register_url)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/register.html')

	def test_register_authenticated_user_redirect(self):
		"""Test that authenticated users are redirected from register page."""
		user = User.objects.create_user(
			username='testuser',
			password='testpass123'
		)
		self.client.login(username='testuser', password='testpass123')
		
		response = self.client.get(self.register_url)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:index'))

	def test_register_post_valid_data(self):
		"""Test POST request with valid registration data."""
		data = {
			'username': 'newuser',
			'password1': 'ComplexPass123!',
			'password2': 'ComplexPass123!'
		}
		
		response = self.client.post(self.register_url, data)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:index'))
		self.assertTrue(User.objects.filter(username='newuser').exists())

	def test_register_post_invalid_data(self):
		"""Test POST request with invalid registration data."""
		data = {
			'username': 'newuser',
			'password1': 'pass123',
			'password2': 'differentpass'
		}
		
		response = self.client.post(self.register_url, data)
		
		self.assertEqual(response.status_code, 200)
		self.assertFalse(User.objects.filter(username='newuser').exists())


class LoginViewTestCase(TestCase):
	"""Test cases for the LoginView."""

	def setUp(self):
		"""Set up test client and user."""
		self.client = Client()
		self.login_url = reverse('chat:login')
		self.user = User.objects.create_user(
			username='testuser',
			password='testpass123'
		)

	def test_login_get_request(self):
		"""Test GET request to login page."""
		response = self.client.get(self.login_url)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/login.html')

	def test_login_authenticated_user_redirect(self):
		"""Test that authenticated users are redirected from login page."""
		self.client.login(username='testuser', password='testpass123')
		
		response = self.client.get(self.login_url)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:index'))

	def test_login_post_valid_credentials(self):
		"""Test POST request with valid login credentials."""
		data = {
			'username': 'testuser',
			'password': 'testpass123'
		}
		
		response = self.client.post(self.login_url, data)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:index'))

	def test_login_post_invalid_credentials(self):
		"""Test POST request with invalid login credentials."""
		data = {
			'username': 'testuser',
			'password': 'wrongpassword'
		}
		
		response = self.client.post(self.login_url, data)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/login.html')


class LogoutViewTestCase(TestCase):
	"""Test cases for the LogoutView."""

	def setUp(self):
		"""Set up test client and user."""
		self.client = Client()
		self.logout_url = reverse('chat:logout')
		self.user = User.objects.create_user(
			username='testuser',
			password='testpass123'
		)

	def test_logout_authenticated_user(self):
		"""Test logout for an authenticated user."""
		self.client.login(username='testuser', password='testpass123')
		
		response = self.client.get(self.logout_url)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:login'))

	def test_logout_unauthenticated_user(self):
		"""Test logout for an unauthenticated user."""
		response = self.client.get(self.logout_url)
		
		self.assertEqual(response.status_code, 302)
		self.assertRedirects(response, reverse('chat:login'))


class InboxViewTestCase(TestCase):
	"""Test cases for the InboxView."""

	def setUp(self):
		"""Set up test client and users."""
		self.client = Client()
		self.inbox_url = reverse('chat:index')
		self.user1 = User.objects.create_user(
			username='user1',
			password='testpass123'
		)
		self.user2 = User.objects.create_user(
			username='user2',
			password='testpass123'
		)
		self.user3 = User.objects.create_user(
			username='user3',
			password='testpass123'
		)

	def test_inbox_view_requires_login(self):
		"""Test that inbox view requires authentication."""
		response = self.client.get(self.inbox_url)
		
		self.assertEqual(response.status_code, 302)
		self.assertTrue(response.url.startswith('/login/'))

	def test_inbox_view_authenticated(self):
		"""Test inbox view for authenticated user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.inbox_url)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/index.html')

	def test_inbox_excludes_current_user(self):
		"""Test that inbox doesn't list the current user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.inbox_url)
		
		user_list = response.context['user_list']
		user_ids = [u['user'].id for u in user_list]
		
		self.assertNotIn(self.user1.id, user_ids)
		self.assertIn(self.user2.id, user_ids)
		self.assertIn(self.user3.id, user_ids)

	def test_inbox_message_sorting(self):
		"""Test that messages are sorted by most recent."""
		from chat_app.models import Message
		
		# Create messages
		msg1 = Message.objects.create(
			sender=self.user2,
			recipient=self.user1,
			content='First message'
		)
		msg1.timestamp = timezone.now() - timedelta(hours=2)
		msg1.save()
		
		msg2 = Message.objects.create(
			sender=self.user3,
			recipient=self.user1,
			content='Second message'
		)
		msg2.timestamp = timezone.now() - timedelta(hours=1)
		msg2.save()
		
		self.client.login(username='user1', password='testpass123')
		response = self.client.get(self.inbox_url)
		
		user_list = response.context['user_list']
		self.assertEqual(user_list[0]['user'].id, self.user3.id)
		self.assertEqual(user_list[1]['user'].id, self.user2.id)


class ChatViewTestCase(TestCase):
	"""Test cases for the ChatView."""

	def setUp(self):
		"""Set up test client and users."""
		self.client = Client()
		self.user1 = User.objects.create_user(
			username='user1',
			password='testpass123'
		)
		self.user2 = User.objects.create_user(
			username='user2',
			password='testpass123'
		)
		self.chat_url = reverse('chat:chat', args=['user2'])

	def test_chat_view_requires_login(self):
		"""Test that chat view requires authentication."""
		response = self.client.get(self.chat_url)
		
		self.assertEqual(response.status_code, 302)

	def test_chat_view_authenticated(self):
		"""Test chat view for authenticated user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.chat_url)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/chat.html')

	def test_chat_view_invalid_user(self):
		"""Test chat view with non-existent user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(reverse('chat:chat', args=['nonexistent']))
		
		self.assertEqual(response.status_code, 404)

	def test_chat_view_marks_messages_as_read(self):
		"""Test that opening chat marks messages as read."""
		from chat_app.models import Message
		
		# Create unread message
		message = Message.objects.create(
			sender=self.user2,
			recipient=self.user1,
			content='Test message',
			is_read=False
		)
		
		self.client.login(username='user1', password='testpass123')
		response = self.client.get(self.chat_url)
		
		message.refresh_from_db()
		self.assertTrue(message.is_read)

	def test_chat_view_message_history(self):
		"""Test that chat view displays message history."""
		from chat_app.models import Message
		
		msg1 = Message.objects.create(
			sender=self.user1,
			recipient=self.user2,
			content='Hello'
		)
		msg2 = Message.objects.create(
			sender=self.user2,
			recipient=self.user1,
			content='Hi there'
		)
		
		self.client.login(username='user1', password='testpass123')
		response = self.client.get(self.chat_url)
		
		messages = response.context['messages']
		self.assertEqual(len(messages), 2)
		self.assertEqual(messages[0].content, 'Hello')
		self.assertEqual(messages[1].content, 'Hi there')


class UserListViewTestCase(TestCase):
	"""Test cases for the UserListView."""

	def setUp(self):
		"""Set up test client and users."""
		self.client = Client()
		self.user_list_url = reverse('chat:user_list')
		self.user1 = User.objects.create_user(
			username='user1',
			password='testpass123'
		)
		self.user2 = User.objects.create_user(
			username='user2',
			password='testpass123'
		)
		self.user3 = User.objects.create_user(
			username='user3',
			password='testpass123'
		)

	def test_user_list_view_requires_login(self):
		"""Test that user list view requires authentication."""
		response = self.client.get(self.user_list_url)
		
		self.assertEqual(response.status_code, 302)

	def test_user_list_view_authenticated(self):
		"""Test user list view for authenticated user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.user_list_url)
		
		self.assertEqual(response.status_code, 200)
		self.assertTemplateUsed(response, 'chat/user_list.html')

	def test_user_list_excludes_current_user(self):
		"""Test that user list doesn't include the current user."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.user_list_url)
		
		users = response.context['users']
		user_ids = [u.id for u in users]
		
		self.assertNotIn(self.user1.id, user_ids)
		self.assertIn(self.user2.id, user_ids)
		self.assertIn(self.user3.id, user_ids)

	def test_user_list_count(self):
		"""Test that user list contains correct number of users."""
		self.client.login(username='user1', password='testpass123')
		
		response = self.client.get(self.user_list_url)
		
		users = response.context['users']
		self.assertEqual(len(users), 2)

