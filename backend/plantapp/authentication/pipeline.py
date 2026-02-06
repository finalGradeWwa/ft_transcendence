from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings

def set_email_for_new_user(backend, details, user=None, *args, **kwargs):
    if user:
        return

    if backend.name == 'github' and details.get('email'):
        return {
            'email': details['email']
        }

def get_tokens_for_user(backend, user, *args, **kwargs):
    # Check whether this is a GitHub OAuth login
    if backend.name == 'github':
        # Generate JWT tokens for the authenticated user
        refresh = RefreshToken.for_user(user)
        access_token = str(refresh.access_token)
        refresh_token = str(refresh)
        response = redirect(f'{settings.FRONTEND_URL}/auth/callback?access_token={access_token}&refresh_token={refresh_token}')
        return response

    return {}


