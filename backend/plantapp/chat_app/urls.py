from django.urls import path
from . import views

app_name = 'chat'

urlpatterns = [
    path('', views.InboxView.as_view(), name='index'),
    path('register/', views.RegisterView.as_view(), name='register'),
    path('login/', views.LoginView.as_view(), name='login'),
    path('logout/', views.LogoutView.as_view(), name='logout'),
    path('users/', views.UserListView.as_view(), name='user_list'),
    path('chat/<str:username>/', views.ChatView.as_view(), name='chat'),
]
