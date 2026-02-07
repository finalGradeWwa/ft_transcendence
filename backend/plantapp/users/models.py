from django.db import models
from django.contrib.auth.models import (AbstractBaseUser,
 BaseUserManager, PermissionsMixin)
from django.utils import timezone

# Create your models here.

class UserManager(BaseUserManager):
    def create_user(self, email, username, password=None, **extra_fields):
        if not email:
            raise ValueError('The Email field must be set')
        email = self.normalize_email(email)
        user = self.model(username=username, email=email, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_superuser(self, email, username, password=None, **extra_fields):
        extra_fields.setdefault('is_staff', True)
        extra_fields.setdefault('is_superuser', True)
        return self.create_user(email, username, password, **extra_fields)


class User(AbstractBaseUser, PermissionsMixin):
    first_name = models.CharField(max_length=100, null=True,
 blank=True)
    last_name = models.CharField(max_length=100, null=True,
 blank=True)
    username = models.CharField(max_length=50, unique=True,
 null=False, blank=False)
    email = models.EmailField(max_length=200, unique=True,
 null=False, blank=False)
    avatar_photo = models.ImageField(upload_to='avatars/', null=True, blank=True)
    # Other fields
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    objects = UserManager()
    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username

    date_joined = models.DateTimeField(default=timezone.now)
    bio = models.TextField(verbose_name="Biography", max_length=600, null=True, blank=True)
    following = models.ManyToManyField("self", blank=True,symmetrical=False, related_name="followers")

    def count_following(self):
        return self.following.count()

    def count_followers(self):
        return self.followers.count()

    def get_friends(self):
        """Return all mutual friends (users who follow each other)."""
        return self.following.filter(followers=self)

    def count_friends(self):
        """Return count of mutual friends."""
        return self.get_friends().count()

    def get_pending_requests(self):
        """Return users who follow you but you don't follow back."""
        return self.followers.exclude(followers=self)

    def get_outgoing_requests(self):
        """Return users you follow but who don't follow you back."""
        return self.following.exclude(following=self)

    def is_following(self, user):
        """Check if this user is following another user."""
        return self.following.filter(pk=user.pk).exists()

    def is_friend_with(self, user):
        """Check if the given user is a friend (mutual follow)."""
        return self.following.filter(pk=user.pk).exists() and self.followers.filter(pk=user.pk).exists()

    def remove_friend(self, user):
        """Remove friend (unfollow and they unfollow back)."""
        self.following.remove(user)
        user.following.remove(self)


class Friend(models.Model):
    """Model to track mutual friend relationships."""
    user1 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_initiated")
    user2 = models.ForeignKey(User, on_delete=models.CASCADE, related_name="friendships_received")
    created_at = models.DateTimeField(auto_now_add=True)

    class Meta:
        unique_together = ("user1", "user2")
        indexes = [
            models.Index(fields=["user1", "user2"]),
        ]

    def __str__(self):
        return f"{self.user1.username} <-> {self.user2.username}"
