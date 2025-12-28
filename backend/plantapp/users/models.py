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
    fullname = models.CharField(max_length=100, null=True,
 blank=True)
    username = models.CharField(max_length=50, unique=True,
 null=False, blank=False)
    email = models.EmailField(max_length=200, unique=True,
 null=False, blank=False)
    # Other fields

    date_joined = models.DateTimeField(default=timezone.now)
    is_active = models.BooleanField(default=True)
    is_staff = models.BooleanField(default=False)
    is_superuser = models.BooleanField(default=False)
    avatar_photo = models.ImageField(upload_to="users/static", null=True, blank=True)
    # number_of_plants = models.DecimalField()
    # plants = models.ManyToManyField('Plant', related_name='plants_list')
    friends = models.ManyToManyField(
        'User',
        related_name='friends_list',
        symmetrical=True,
        help_text='Friendships are automatically mutual: if you add a user as a friend, they are also your friend.',
    )
    bio = models.TextField(verbose_name="Biography", max_length=600, null=True, blank=True)
    objects = UserManager()

    USERNAME_FIELD = 'email'
    REQUIRED_FIELDS = ['username']

    def __str__(self):
        return self.username
