from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.InboxAPIView.as_view(), name='index'),
    path('users/', views.UserListAPIView.as_view(), name='user_list'),
    path('chat/<str:username>/', views.ConversationAPIView.as_view(), name='chat'),
]
