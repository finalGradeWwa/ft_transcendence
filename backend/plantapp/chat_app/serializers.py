from rest_framework import serializers
from django.contrib.auth import get_user_model

from .models import Message


class SimpleUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = get_user_model()
        fields = ("id", "username")


class MessageSerializer(serializers.ModelSerializer):
    sender = SimpleUserSerializer(read_only=True)
    recipient = SimpleUserSerializer(read_only=True)

    class Meta:
        model = Message
        fields = ("id", "sender", "recipient", "content", "timestamp", "is_read")
