from django.contrib.auth import get_user_model
from django.contrib.auth.password_validation import validate_password
from rest_framework import serializers

User = get_user_model()

class UserRegistrationSerializer(serializers.ModelSerializer):
	password = serializers.CharField(write_only=True, min_length=8)
	password_confirm = serializers.CharField(write_only=True, min_length=8)

	class Meta:
		model = User
		fields = ("username", "email", "password", "password_confirm", "fullname", "bio", "avatar_photo")

	def validate_email(self, value: str) -> str:
		# Unique email
		if User.objects.filter(email__iexact=value).exists():
			raise serializers.ValidationError("This email is already taken.")
		return value

	def validate_username(self, value: str) -> str:
		# Unique username
		if User.objects.filter(username__iexact=value).exists():
			raise serializers.ValidationError("This username is already taken.")
		return value

	def validate(self, attrs):
		password = attrs.get("password")
		password_confirm = attrs.get("password_confirm")

		if password != password_confirm:
			raise serializers.ValidationError({"password_confirm": "Password must match."})

		validate_password(password)
		return attrs

	def create(self, validated_data):
		validated_data.pop("password_confirm")
		password = validated_data.pop("password")

		user = User.objects.create_user(password=password, **validated_data)
		return user

class ChangePasswordSerializer(serializers.Serializer):

    old_password = serializers.CharField(write_only=True)
    new_password = serializers.CharField(write_only=True, min_length=8)
    new_password_confirm = serializers.CharField(write_only=True, min_length=8)

    def validate(self, attrs):
        request = self.context.get("request")
        user = getattr(request, "user", None)

        if user is None or not user.is_authenticated:
            raise serializers.ValidationError("No authenticated user found.")

        old_password = attrs.get("old_password")
        new_password = attrs.get("new_password")
        new_password_confirm = attrs.get("new_password_confirm")

        if not user.check_password(old_password):
            raise serializers.ValidationError({"old_password": "Old password is incorrect."})

        if new_password != new_password_confirm:
            raise serializers.ValidationError({"new_password_confirm": "Passwords must match."})

        validate_password(new_password, user=user)
        return attrs

    def save(self, **kwargs):
        request = self.context["request"]
        user = request.user
        user.set_password(self.validated_data["new_password"])
        user.save(update_fields=["password"])
        return user
