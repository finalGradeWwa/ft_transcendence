from django.urls import path
from .views import (
    MeView, UnfriendAPIView,
    ListFriendsAPIView, IsFriendAPIView, UserFriendsListAPIView,
    FriendRequestsListAPIView, RejectFriendRequestAPIView,
    SendFriendRequestAPIView, AcceptFriendRequestAPIView,
    CancelFriendRequestAPIView, OutgoingFriendRequestsListAPIView,
    UserProfileView, UserSearchAPIView
)


urlpatterns = [
	path('api/auth/me/', MeView.as_view(), name='me'),
	path('users/profile/<str:username>/', UserProfileView.as_view(), name='user-profile'),
    path('users/<int:user_id>/unfriend/', UnfriendAPIView.as_view(), name='unfriend'),
    path('users/<int:user_id>/friends/', ListFriendsAPIView.as_view(), name='list-friends'),
    path('users/<int:user_id>/is-friend/', IsFriendAPIView.as_view(), name='is-friend'),
    path('api/friends/', UserFriendsListAPIView.as_view(), name='my-friends'),
    path('api/friend-requests/', FriendRequestsListAPIView.as_view(), name='friend-requests'),
    path('api/friend-requests/outgoing/', OutgoingFriendRequestsListAPIView.as_view(), name='outgoing-friend-requests'),
    path('users/<int:user_id>/send-request/', SendFriendRequestAPIView.as_view(), name='send-friend-request'),
    path('users/<int:user_id>/accept/', AcceptFriendRequestAPIView.as_view(), name='accept-friend-request'),
    path('users/<int:user_id>/reject/', RejectFriendRequestAPIView.as_view(), name='reject-friend-request'),
    path('users/<int:user_id>/cancel-request/', CancelFriendRequestAPIView.as_view(), name='cancel-friend-request'),
    path('users/search/', UserSearchAPIView.as_view(), name='user-search'),
]