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
            "date_joined",
            "is_active",
            "avatar_photo",
            "plants_count",
            "gardens_count",
        )
        read_only_fields = fields
    
    def get_plants_count(self, obj):
        return obj.plants.count()
    
    def get_gardens_count(self, obj):
        return obj.memberships.count()


class UserUpdateSerializer(serializers.ModelSerializer):
    old_password = serializers.CharField(write_only=True, required=True)
    password = serializers.CharField(write_only=True, required=False)
    password_confirm = serializers.CharField(write_only=True, required=False)

    class Meta:
        model = User
        fields = (
            "username",
            "email",
            "first_name",
            "last_name",
            "avatar_photo",
            "old_password",
            "password",
            "password_confirm",
        )
        extra_kwargs = {
            'email': {'required': False, 'allow_blank': True},
            'username': {'required': False},
        }

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

    def validate(self, data):
        password = data.get('password')
        password_confirm = data.get('password_confirm')

        if password and password != password_confirm:
            raise serializers.ValidationError({"password_confirm": "Passwords do not match."})

        return data

    def update(self, instance, validated_data):
        old_password = validated_data.pop('old_password', None)
        new_password = validated_data.pop('password', None)
        validated_data.pop('password_confirm', None)

        if old_password:
            if not instance.check_password(old_password):
                raise serializers.ValidationError({"old_password": "Wrong password."})

            if new_password:
                instance.set_password(new_password)

        for attr, value in validated_data.items():
            setattr(instance, attr, value)

        instance.save()
        return instance

class PublicUserSerializer(serializers.ModelSerializer):
    class Meta:
        model = User
        fields = ("id", "username", "first_name", "last_name", "avatar_photo")
