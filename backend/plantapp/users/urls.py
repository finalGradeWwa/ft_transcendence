from django.urls import path
from .views import MeView, FollowUserAPIView, UnfollowUserAPIView, ListFollowersAPIView, ListFollowingAPIView, UserSearchAPIView


urlpatterns = [
    path('api/auth/me/', MeView.as_view(), name='me'),
    path('users/<int:user_id>/follow/', FollowUserAPIView.as_view(), name='follow-user'),
    path('users/<int:user_id>/unfollow/', UnfollowUserAPIView.as_view(), name='unfollow-user'),
    path('users/<int:user_id>/followers/', ListFollowersAPIView.as_view(), name='list-followers'),
    path('users/<int:user_id>/following/', ListFollowingAPIView.as_view(), name='list-following'),
    path('users/search/', UserSearchAPIView.as_view(), name='user-search'),
]
