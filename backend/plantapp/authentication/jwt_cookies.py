from django.conf import settings
from datetime import timedelta

REFRESH_COOKIE_NAME = "refresh_token"

refresh_lifetime = settings.SIMPLE_JWT.get("REFRESH_TOKEN_LIFETIME", timedelta(days=1))

def set_refresh_cookie(response, refresh_token: str):
    response.set_cookie(
        REFRESH_COOKIE_NAME,
        refresh_token,
        httponly = True,
        secure = not settings.DEBUG,
        samesite = "Lax",
        path = "/api/",
        max_age = int(refresh_lifetime.total_seconds()),
    )

def clear_refresh_cookie(response):
    response.delete_cookie(
        REFRESH_COOKIE_NAME,
        path = "/api/",
    )
