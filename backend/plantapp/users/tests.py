from django.test import TestCase
from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

# Create your tests here.

User = get_user_model()

class UserModelTests(TestCase):

    def test_create_user_with_username_email_and_password(self):
        user = User.objects.create_user(
            username="testuser",
            email="test@example.com",
            password="strongpassword123",
            bio="hello! my name is User123!",
        )

        self.assertEqual(user.username, "testuser")
        self.assertEqual(user.email, "test@example.com")
        self.assertTrue(user.check_password("strongpassword123"))
        self.assertTrue(user.is_active)
        self.assertFalse(user.is_staff)
        self.assertFalse(user.is_superuser)
        self.assertEqual(user.bio, "hello! my name is User123!")

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

class MeViewTests(APITestCase):

    def setUp(self):
        self.url = reverse('me')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123!',
            firstName='Test',
            lastName='User',
            bio='Test bio'
        )
        self.client.force_authenticate(user=self.user)

    def test_get_me_success(self):
        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['username'], 'testuser')
        self.assertEqual(response.data['email'], 'test@example.com')
        self.assertEqual(response.data['firstName'], 'Test')
        self.assertEqual(response.data['lastName'], 'User')
        self.assertEqual(response.data['bio'], 'Test bio')
        self.assertIn('id', response.data)
        self.assertIn('date_joined', response.data)

    def test_get_me_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.get(self.url)

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_patch_me_success(self):
        response = self.client.patch(self.url, {
            'firstName': 'Updated',
            'lastName': 'Name',
            'bio': 'Updated bio'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['firstName'], 'Updated')
        self.assertEqual(response.data['lastName'], 'Name')
        self.assertEqual(response.data['bio'], 'Updated bio')

        # Verify in database
        self.user.refresh_from_db()
        self.assertEqual(self.user.firstName, 'Updated')
        self.assertEqual(self.user.lastName, 'Name')

    def test_patch_me_partial_update(self):
        response = self.client.patch(self.url, {
            'bio': 'Only bio updated'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertEqual(response.data['bio'], 'Only bio updated')
        self.assertEqual(response.data['firstName'], 'Test')  # Unchanged
        self.assertEqual(response.data['lastName'], 'User')  # Unchanged

    def test_patch_me_duplicate_username(self):
        User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123'
        )

        response = self.client.patch(self.url, {
            'username': 'otheruser'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_patch_me_duplicate_email(self):
        User.objects.create_user(
            username='otheruser',
            email='other@example.com',
            password='password123'
        )

        response = self.client.patch(self.url, {
            'email': 'other@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_patch_me_same_username_allowed(self):
        response = self.client.patch(self.url, {
            'username': 'testuser'  # Same username
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)

    def test_patch_me_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.patch(self.url, {
            'firstName': 'Hacker'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

class FollowAPITests(APITestCase):
    def setUp(self):
        self.alice = User.objects.create_user(
            email="alice@a.com",
            username="alice",
            password="password123",
        )
        self.bob = User.objects.create_user(
            email="bob@b.com",
            username="bob",
            password="password123",
        )
    def test_user_can_follow_another_user(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.bob.id}/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        self.assertTrue(
            self.alice.following.filter(id=self.bob.id).exists()
        )
        self.assertTrue(
            self.bob.followers.filter(id=self.alice.id).exists()
        )
    def test_user_cannot_follow_self(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.alice.id}/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 400)
        self.assertFalse(
            self.alice.following.filter(id=self.alice.id).exists()
        )
    def test_user_can_unfollow(self):
        self.alice.following.add(self.bob)

        self.client.force_authenticate(user=self.alice)
        url = f"/users/{self.bob.id}/unfollow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 200)
        self.assertFalse(
            self.alice.following.filter(id=self.bob.id).exists()
        )

    def test_list_followers(self):
        self.alice.following.add(self.bob)

        url = f"/users/{self.bob.id}/followers/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(len(response.data), 1)
        self.assertEqual(response.data[0]["username"], "alice")

    def test_list_following(self):
        self.alice.following.add(self.bob)

        url = f"/users/{self.alice.id}/following/"
        response = self.client.get(url)

        self.assertEqual(response.status_code, 200)
        self.assertEqual(response.data[0]["username"], "bob")
    
    def test_user_cannot_follow_non_existent(self):
        self.client.force_authenticate(user=self.alice)

        url = "/users/99999/follow/"
        response = self.client.post(url)

        self.assertEqual(response.status_code, 404)

    def test_user_cannot_follow_twice(self):
        self.client.force_authenticate(user=self.alice)

        url = f"/users/{self.bob.id}/follow/"
        response = self.client.post(url)
        response = self.client.post(url)
        
        self.assertEqual(response.status_code, 400)
