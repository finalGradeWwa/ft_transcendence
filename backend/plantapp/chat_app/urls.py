from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
	path('', views.InboxAPIView.as_view(), name='index'),
	path('users/', views.UserListAPIView.as_view(), name='user_list'),
	path('chat/<str:username>/', views.ConversationAPIView.as_view(), name='chat'),
	# PL: Endpoint do pobierania liczby nieprzeczytanych wiadomości. EN: Endpoint for fetching unread messages count.
	path('unread-count/', views.UnreadCountAPIView.as_view(), name='unread_count'),
]
