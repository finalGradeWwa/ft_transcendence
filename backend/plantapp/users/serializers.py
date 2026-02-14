from django.contrib.auth import get_user_model
from rest_framework import serializers

User = get_user_model()

class UserSerializer(serializers.ModelSerializer):
	plants_count = serializers.SerializerMethodField()
	gardens_count = serializers.SerializerMethodField()
	
	class Meta:
		model = User
		fields = (
			"id",
			"first_name",
			"last_name",
			"username",
			"email",
			"bio",
			"date_joined",
			"is_active",
			"avatar_photo",
			"plants_count",
			"gardens_count",
		)
		read_only_fields = fields
	
	def get_plants_count(self, obj):
		"""
		PL: Zwraca liczbę roślin należących do użytkownika.
		EN: Returns the count of plants belonging to the user.
		"""
		return obj.plants.count()
	
	def get_gardens_count(self, obj):
		"""
		PL: Zwraca liczbę ogrodów należących do użytkownika.
		EN: Returns the count of gardens belonging to the user.
		"""
		return obj.memberships.count()


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

class ListFollowersSerializer(serializers.ModelSerializer):
     class Meta:
        model = User
        fields = ("followers",)
        read_only_fields = fields