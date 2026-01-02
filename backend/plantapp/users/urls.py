from django.urls import path
from .views import MeView, FollowUserAPIView, UnfollowUserAPIView, ListFollowersAPIView, ListFollowingAPIView


urlpatterns = [
	path('api/auth/me/', MeView.as_view(), name='me'),
    path("users/<int:user_id>/follow/", FollowUserAPIView.as_view()),
    path("users/<int:user_id>/unfollow/", UnfollowUserAPIView.as_view()),
    path("users/<int:user_id>/followers/", ListFollowersAPIView.as_view()),
    path("users/<int:user_id>/following/", ListFollowingAPIView.as_view()),	
]
