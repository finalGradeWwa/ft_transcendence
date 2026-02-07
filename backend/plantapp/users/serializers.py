from django.contrib.auth import get_user_model
from rest_framework import serializers
from .models import Friend

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = (
            "id",  # Do we need 'id' in users model?
            "first_name",
            "last_name",
            "username",
            "email",
            "bio",
            "date_joined",
            "is_active",
        )
        read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "email", "first_name", "last_name", "bio")

    def validate_email(self, value: str) -> str:
        user = self.instance
        queryset = User.objects.filter(email__iexact=value)
        if user is not None:
            queryset = queryset.exclude(pk=user.pk)
        if queryset.exists():
            raise serializers.ValidationError("This email is already taken.")
        return value

    def validate_username(self, value: str) -> str:
        user = self.instance
        queryset = User.objects.filter(username__iexact=value)
        if user is not None:
            queryset = queryset.exclude(pk=user.pk)
        if queryset.exists():
            raise serializers.ValidationError("This username is already taken.")
        return value

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name")


class FriendSerializer(serializers.ModelSerializer):
    user1 = PublicUserSerializer(read_only=True)
    user2 = PublicUserSerializer(read_only=True)

    class Meta:
        model = Friend
        fields = ("id", "user1", "user2", "created_at")
        read_only_fields = fields

class ListFollowersSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("followers",)
        read_only_fields = fields
