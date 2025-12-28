from django.urls import path
from .views import MeView


urlpatterns = [
	path('api/auth/me/', MeView.as_view(), name='me'),
]
