from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from .jwt_cookies import set_refresh_cookie


def set_email_for_new_user(backend, details, user=None, *args, **kwargs):
    if user:
        return

    if backend.name == 'github' and details.get('email'):
        return {
            'email': details['email']
        }

def get_tokens_for_user(backend, user, *args, **kwargs):

    if backend.name != "github":
        return {}

    refresh = RefreshToken.for_user(user)
    response = redirect(f"{settings.FRONTEND_URL.rstrip('/')}/pl/auth/callback")
    set_refresh_cookie(response, str(refresh))

    return response

