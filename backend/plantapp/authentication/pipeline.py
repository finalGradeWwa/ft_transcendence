from django.shortcuts import redirect
from rest_framework_simplejwt.tokens import RefreshToken
from django.conf import settings
from datetime import timedelta


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
    refresh_lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME", timedelta(days=1))

    response = redirect(f"{settings.FRONTEND_URL.rstrip('/')}/pl/auth/callback")
    response.set_cookie(
        "refresh_token",
        str(refresh),
        httponly = True,
        secure = not settings.DEBUG,
        samesite = "Lax",
        path = "/api/auth/",
        max_age = int(refresh_lifetime.total_seconds()),
    )
    return response


