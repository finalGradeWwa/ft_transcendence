from django.urls import path

from rest_framework_simplejwt.views import (
    TokenObtainPairView,
    TokenRefreshView,
	TokenVerifyView,
)

from .views import RegisterView, ChangePasswordView, LogoutView


urlpatterns = [
	# JWT Token endpoints
	path('api/token/', TokenObtainPairView.as_view(), name='token_obtain_pair'),
    path('api/token/refresh/', TokenRefreshView.as_view(), name='token_refresh'),
	path('api/token/verify/', TokenVerifyView.as_view(), name='token_verify'),

	# Auth endpoints
	path('api/auth/register/', RegisterView.as_view(), name='register'),
	path('api/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
	path('api/auth/logout/', LogoutView.as_view(), name='logout'),
]

