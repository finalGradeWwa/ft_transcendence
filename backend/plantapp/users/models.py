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
    # Internal field: stores friend connections/requests (mutual = friends, one-way = pending request)
    following = models.ManyToManyField("self", blank=True,symmetrical=False, related_name="followers")

    def get_friends(self):
        """Return all mutual friends (users with mutual friend connections)."""
        # Get users we have a connection with who also have a connection back to us
        mutual_friends = self.following.filter(following=self).exclude(pk=self.pk)
        return mutual_friends

    def count_friends(self):
        """Return count of mutual friends."""
        return self.get_friends().count()

    def get_pending_requests(self):
        """Return incoming friend requests (users who sent you a friend request)."""
        # Find users who have sent us a request but we haven't accepted yet
        return User.objects.filter(following=self).exclude(pk__in=self.following.values_list('pk', flat=True))

    def get_outgoing_requests(self):
        """Return outgoing friend requests (users you've sent requests to but haven't been accepted)."""
        return self.following.exclude(following=self)


    def is_friend_with(self, user):
        """Check if the given user is a friend (mutual connection)."""
        # Ensure we're not comparing with self
        if user.pk == self.pk:
            return False
        # Check for mutual friend connection
        return self.following.filter(pk=user.pk).exists() and user.following.filter(pk=self.pk).exists()

    def unfriend(self, user):
        """Remove mutual friendship by removing both connections."""
        # Remove both directions of the friendship
        self.following.remove(user)
        user.following.remove(self)



