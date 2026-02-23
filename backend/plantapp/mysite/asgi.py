"""
ASGI config for mysite project.

It exposes the ASGI callable as a module-level variable named ``application``.

For more information on this file, see
https://docs.djangoproject.com/en/6.0/howto/deployment/asgi/
"""

import importlib
import os

from channels.routing import ProtocolTypeRouter, URLRouter
from django.core.asgi import get_asgi_application

os.environ.setdefault('DJANGO_SETTINGS_MODULE', 'mysite.settings')

# Initialize Django ASGI application early to ensure the AppRegistry
# is populated before importing code that may import ORM models.
django_asgi_app = get_asgi_application()

chat_routing = importlib.import_module("chat_app.routing")
chat_middleware = importlib.import_module("chat_app.middleware")

application = ProtocolTypeRouter({
    "http": django_asgi_app,
    "websocket": chat_middleware.JwtAuthMiddlewareStack(
        URLRouter(
            chat_routing.websocket_urlpatterns
        )
    ),
})