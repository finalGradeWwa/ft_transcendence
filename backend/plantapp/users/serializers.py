from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	class Meta:
		model = User
		fields = (
			"id",
			"username",
			"email",
			"fullname",
			"avatar_photo",
			"bio",
			"date_joined",
			"is_active",
		)
		read_only_fields = fields


class UserUpdateSerializer(serializers.ModelSerializer):

    class Meta:
        model = User
        fields = ("username", "email", "fullname", "bio", "avatar_photo")

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
