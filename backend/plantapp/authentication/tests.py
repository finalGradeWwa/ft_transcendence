from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

User = get_user_model()


class RegisterViewTests(APITestCase):

    def setUp(self):
        self.url = reverse('register')
        self.valid_data = {
            'username': 'testuser',
            'email': 'test@example.com',
            'password': 'SecurePass123!',
            'password_confirm': 'SecurePass123!',
        }

    def test_register_success(self):
        response = self.client.post(self.url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_201_CREATED)
        self.assertIn('user', response.data)
        self.assertIn('tokens', response.data)
        self.assertIn('access', response.data['tokens'])
        self.assertIn('refresh', response.data['tokens'])
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['user']['email'], 'test@example.com')

        # Verify user was created in database
        self.assertTrue(User.objects.filter(username='testuser').exists())

    def test_register_password_mismatch(self):
        data = self.valid_data.copy()
        data['password_confirm'] = 'DifferentPass123!'

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password_confirm', str(response.data))

    def test_register_duplicate_username(self):
        User.objects.create_user(
            username='testuser',
            email='existing@example.com',
            password='password123'
        )

        response = self.client.post(self.url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('username', response.data)

    def test_register_duplicate_email(self):
        """Duplicate email returns 400 error"""
        User.objects.create_user(
            username='existinguser',
            email='test@example.com',
            password='password123'
        )

        response = self.client.post(self.url, self.valid_data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_register_weak_password(self):
        data = self.valid_data.copy()
        data['password'] = '123'
        data['password_confirm'] = '123'

        response = self.client.post(self.url, data, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_register_missing_fields(self):
        response = self.client.post(self.url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)


class LoginTests(APITestCase):

    def setUp(self):
        self.url = reverse('token_obtain_pair')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123!'
        )

    def test_login_success(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'SecurePass123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('access', response.data)
        self.assertIn('refresh', response.data)

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {
            'username': 'testuser',
            'password': 'WrongPassword!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_login_nonexistent_user(self):
        response = self.client.post(self.url, {
            'username': 'nouser',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class ChangePasswordViewTests(APITestCase):

    def setUp(self):
        self.url = reverse('change_password')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='OldPassword123!'
        )
        self.client.force_authenticate(user=self.user)

    def test_change_password_success(self):
        response = self.client.post(self.url, {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword456!',
            'new_password_confirm': 'NewPassword456!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('detail', response.data)

        # Verify new password works
        self.user.refresh_from_db()
        self.assertTrue(self.user.check_password('NewPassword456!'))

    def test_change_password_wrong_old_password(self):
        response = self.client.post(self.url, {
            'old_password': 'WrongOldPassword!',
            'new_password': 'NewPassword456!',
            'new_password_confirm': 'NewPassword456!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('old_password', str(response.data))

    def test_change_password_mismatch(self):
        response = self.client.post(self.url, {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword456!',
            'new_password_confirm': 'DifferentPassword!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_change_password_unauthenticated(self):
        self.client.force_authenticate(user=None)

        response = self.client.post(self.url, {
            'old_password': 'OldPassword123!',
            'new_password': 'NewPassword456!',
            'new_password_confirm': 'NewPassword456!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)


class LogoutViewTests(APITestCase):

    def setUp(self):
        self.url = reverse('logout')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123!'
        )
        # Get tokens
        login_response = self.client.post(reverse('token_obtain_pair'), {
            'username': 'testuser',
            'password': 'SecurePass123!'
        }, format='json')
        self.refresh_token = login_response.data['refresh']
        self.access_token = login_response.data['access']
        self.client.credentials(HTTP_AUTHORIZATION=f'Bearer {self.access_token}')

    def test_logout_success(self):
        response = self.client.post(self.url, {
            'refresh': self.refresh_token
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

        # Verify refresh token is invalidated
        refresh_response = self.client.post(reverse('token_refresh'), {
            'refresh': self.refresh_token
        }, format='json')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_missing_refresh_token(self):
        response = self.client.post(self.url, {}, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('error', response.data)

    def test_logout_invalid_refresh_token(self):
        response = self.client.post(self.url, {
            'refresh': 'invalid-token-here'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)

    def test_logout_unauthenticated(self):
        self.client.credentials()  # Remove authorization

        response = self.client.post(self.url, {
            'refresh': self.refresh_token
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
