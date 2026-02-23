from urllib.parse import parse_qs

from channels.db import database_sync_to_async
from django.contrib.auth.models import AnonymousUser
from django.contrib.auth import get_user_model
from rest_framework_simplejwt.tokens import AccessToken
from rest_framework_simplejwt.exceptions import TokenError


@database_sync_to_async
def _get_user_by_id(user_id):
    User = get_user_model()
    try:
        return User.objects.get(id=user_id)
    except User.DoesNotExist:
        return AnonymousUser()


class JwtAuthMiddleware:
    def __init__(self, inner):
        self.inner = inner

    async def __call__(self, scope, receive, send):
        user = scope.get("user")
        if user is None or not getattr(user, "is_authenticated", False):
            query_string = scope.get("query_string", b"").decode()
            params = parse_qs(query_string)
            token_values = params.get("token", [])
            token = token_values[0] if token_values else None

            if token:
                try:
                    access_token = AccessToken(token)
                    user_id = access_token.get("user_id")
                    if user_id is not None:
                        scope["user"] = await _get_user_by_id(user_id)
                except TokenError:
                    scope["user"] = AnonymousUser()

        if scope.get("user") is None:
            scope["user"] = AnonymousUser()

        return await self.inner(scope, receive, send)


def JwtAuthMiddlewareStack(inner):
    return JwtAuthMiddleware(inner)
