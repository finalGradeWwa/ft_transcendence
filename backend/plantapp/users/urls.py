from django.urls import path
from .views import (
    MeView, FollowUserAPIView, UnfollowUserAPIView, 
    ListFollowersAPIView, ListFollowingAPIView,
    ListFriendsAPIView, IsFriendAPIView, UserFriendsListAPIView,
    FriendRequestsListAPIView
)


urlpatterns = [
	path('api/auth/me/', MeView.as_view(), name='me'),
    path("users/<int:user_id>/follow/", FollowUserAPIView.as_view(), name='follow-user'),
    path("users/<int:user_id>/unfollow/", UnfollowUserAPIView.as_view(), name='unfollow-user'),
    path("users/<int:user_id>/followers/", ListFollowersAPIView.as_view(), name='list-followers'),
    path("users/<int:user_id>/following/", ListFollowingAPIView.as_view(), name='list-following'),
    path("users/<int:user_id>/friends/", ListFriendsAPIView.as_view(), name='list-friends'),
    path("users/<int:user_id>/is-friend/", IsFriendAPIView.as_view(), name='is-friend'),
    path("api/friends/", UserFriendsListAPIView.as_view(), name='my-friends'),
    path("api/friend-requests/", FriendRequestsListAPIView.as_view(), name='friend-requests'),
]
