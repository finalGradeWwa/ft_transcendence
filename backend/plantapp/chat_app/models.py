from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone

# Create your models here.


class Conversation(models.Model):
    created_at = models.DateTimeField(default=timezone.now)
    id = 

class Message(models.Model):
    conversation = models.ForeignKey(Conversation, related_name='chat', on_delete=models.CASCADE)
    sender = models.ForeignKey(User, on_delete=models.CASCADE)
    content = models.TextField()
    timestamp = models.DateTimeField(auto_now_add=True)