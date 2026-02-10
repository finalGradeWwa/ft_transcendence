from django.urls import path
from .views import RegisterView, ChangePasswordView, LogoutView, LoginView, CookieTokenRefreshView,api_root


urlpatterns = [
	path('', api_root, name='api_root'),
	path('api/auth/register/', RegisterView.as_view(), name='register'),
	path('api/auth/change-password/', ChangePasswordView.as_view(), name='change_password'),
	path('api/auth/logout/', LogoutView.as_view(), name='logout'),
	path('api/auth/login/', LoginView.as_view(), name='login'),
	path('api/auth/token/refresh/', CookieTokenRefreshView.as_view()),
]

