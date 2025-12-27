from django.test import TestCase
from django.contrib.auth import get_user_model
import datetime
# Create your tests here.

User = get_user_model()

class UserModelTests(TestCase):

    def test_create_user_with_username_email_and_password(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="strongpassword123",
            # date_joined=datetime.datetime.now()
        )

        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("strongpassword123"))
        # self.assertEqual(user.date_joined, datetime.date())
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)

    def test_email_is_normalized(self):
        user = User.objects.create_user(
            username="normuser",
            email="TEST@EXAMPLE.COM",
            password="password123"
        )
        self.assertEqual(user.email, "TEST@example.com")

    def test_create_user_without_email_raises_error(self):
        with self.assertRaises(ValueError):
            User.objects.create_user(
                username="noemail",
                email="",
                password="password123"
            )

    def test_create_superuser(self):
        admin = User.objects.create_superuser(
            username="admin",
            email="admin@example.com",
            password="adminpass123"
        )

        self.assertTrue(admin.is_staff)
        self.assertTrue(admin.is_superuser)
        self.assertTrue(admin.is_active)

    def test_str_representation(self):
        user = User.objects.create_user(
            username="stringuser",
            email="string@example.com",
            password="password123"
        )
        self.assertEqual(str(user), user.username)
