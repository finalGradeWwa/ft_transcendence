from django.urls import reverse
from rest_framework.test import APITestCase
from rest_framework import status
from django.contrib.auth import get_user_model

from .jwt_cookies import REFRESH_COOKIE_NAME
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
        self.assertIn(REFRESH_COOKIE_NAME, response.cookies)
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
        self.url = reverse('login')
        self.user = User.objects.create_user(
            username='testuser',
            email='test@example.com',
            password='SecurePass123!'
        )

    def test_login_success(self):
        response = self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'SecurePass123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn('user', response.data)
        self.assertIn(REFRESH_COOKIE_NAME, response.cookies)
        self.assertEqual(response.data['user']['username'], 'testuser')
        self.assertEqual(response.data['user']['email'], 'test@example.com')

    def test_login_wrong_password(self):
        response = self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'WrongPassword!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_login_nonexistent_user(self):
        response = self.client.post(self.url, {
            'email': 'nouser@example.com',
            'password': 'password123'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)

    def test_login_missing_email(self):
        response = self.client.post(self.url, {
            'password': 'SecurePass123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('email', response.data)

    def test_login_missing_password(self):
        response = self.client.post(self.url, {
            'email': 'test@example.com'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('password', response.data)

    def test_login_case_insensitive_email(self):
        response = self.client.post(self.url, {
            'email': 'TEST@EXAMPLE.COM',
            'password': 'SecurePass123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_200_OK)
        self.assertIn(REFRESH_COOKIE_NAME, response.cookies)

    def test_login_inactive_user(self):
        self.user.is_active = False
        self.user.save(update_fields=['is_active'])

        response = self.client.post(self.url, {
            'email': 'test@example.com',
            'password': 'SecurePass123!'
        }, format='json')

        self.assertEqual(response.status_code, status.HTTP_400_BAD_REQUEST)
        self.assertIn('non_field_errors', response.data)
        self.assertNotIn('user', response.data)



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
        # Login to get cookie
        login_response = self.client.post(reverse('login'), {
            'email': 'test@example.com',
            'password': 'SecurePass123!'
        }, format='json')

        # Save refresh token value for verification later
        self.refresh_token_value = login_response.cookies[REFRESH_COOKIE_NAME].value

        # Authenticate for permission check (IsAuthenticated)
        self.client.force_authenticate(user=self.user)

    def test_logout_success(self):
        # Cookie is already in self.client from setUp login
        response = self.client.post(self.url)

        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)
        # Verify cookie is cleared (empty string)
        self.assertEqual(response.cookies[REFRESH_COOKIE_NAME].value, '')

        # Verify refresh token is invalidated (blacklisted)
        # We manually set the cookie back to the old value to test if it's rejected
        self.client.cookies[REFRESH_COOKIE_NAME] = self.refresh_token_value
        refresh_response = self.client.post('/api/auth/token/refresh/')
        self.assertEqual(refresh_response.status_code, status.HTTP_401_UNAUTHORIZED)

    def test_logout_missing_refresh_token(self):
        self.client.cookies.clear()
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_invalid_refresh_token(self):
        self.client.cookies[REFRESH_COOKIE_NAME] = 'invalid-token'
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_205_RESET_CONTENT)

    def test_logout_unauthenticated(self):
        self.client.force_authenticate(user=None)
        response = self.client.post(self.url)
        self.assertEqual(response.status_code, status.HTTP_401_UNAUTHORIZED)
