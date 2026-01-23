from django.db import models
from django.conf import settings
from django.utils import timezone


class Message(models.Model):
	sender = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='sent_messages'
	)
	recipient = models.ForeignKey(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='received_messages'
	)
	content = models.TextField()
	timestamp = models.DateTimeField(auto_now_add=True)
	is_read = models.BooleanField(default=False)

	class Meta:
		ordering = ['timestamp']

	def __str__(self):
		return f"Message from {self.sender.username} to {self.recipient.username}"


class UserProfile(models.Model):

	user = models.OneToOneField(
		settings.AUTH_USER_MODEL,
		on_delete=models.CASCADE,
		related_name='chat_profile'
	)
	is_online = models.BooleanField(default=False)
	last_seen = models.DateTimeField(auto_now=True)

	class Meta:
		verbose_name_plural = "User Profiles"

	def __str__(self):
		return f"UserProfile of {self.user.username}"

