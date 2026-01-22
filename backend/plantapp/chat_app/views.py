"""
Views for chat application.
"""
from django.shortcuts import render, redirect, get_object_or_404
from django.contrib.auth import login, authenticate, logout, get_user_model
from django.contrib.auth.decorators import login_required
from django.contrib.auth.forms import UserCreationForm, AuthenticationForm
from django.contrib import messages
from django.db.models import Q, Max
from django.utils import timezone
from django.views import View
from django.views.generic import TemplateView, ListView, DetailView
from django.utils.decorators import method_decorator
from django.http import JsonResponse
from .models import Message, UserProfile

User = get_user_model()


class RegisterView(View): #to be removed
	"""User registration view."""
	
	def get(self, request):
		if request.user.is_authenticated:
			return redirect('chat:index')
		
		form = UserCreationForm()
		return render(request, 'chat/register.html', {'form': form})
	
	def post(self, request):
		if request.user.is_authenticated:
			return redirect('chat:index')
		
		form = UserCreationForm(request.POST)
		if form.is_valid():
			user = form.save()
			UserProfile.objects.create(user=user)
			login(request, user)
			messages.success(request, 'Registration successful!')
			return redirect('chat:index')
		
		return render(request, 'chat/register.html', {'form': form})


class LoginView(View): #to be removed
	"""User login view."""
	
	def get(self, request):
		if request.user.is_authenticated:
			return redirect('chat:index')
		
		form = AuthenticationForm()
		return render(request, 'chat/login.html', {'form': form})
	
	def post(self, request):
		if request.user.is_authenticated:
			return redirect('chat:index')
		
		form = AuthenticationForm(request, data=request.POST)
		if form.is_valid():
			username = form.cleaned_data.get('username')
			password = form.cleaned_data.get('password')
			user = authenticate(username=username, password=password)
			if user is not None:
				login(request, user)
				# Update online status
				profile, _ = UserProfile.objects.get_or_create(user=user)
				profile.is_online = True
				profile.save()
				return redirect('chat:index')
		
		return render(request, 'chat/login.html', {'form': form})


class LogoutView(View): #to be removed
	"""User logout view."""
	
	def get(self, request):
		if request.user.is_authenticated:
			profile = UserProfile.objects.filter(user=request.user).first()
			if profile:
				profile.is_online = False
				profile.save()
		logout(request)
		return redirect('chat:login')


@method_decorator(login_required, name='dispatch')
class InboxView(View):
	"""Main page with list of users to chat with."""
	
	def get(self, request):
		# Get all users except current user
		users = User.objects.exclude(id=request.user.id)
		
		# Get last message for each user
		user_list = []
		for user in users:
			last_message = Message.objects.filter(
				Q(sender=request.user, recipient=user) |
				Q(sender=user, recipient=request.user)
			).order_by('-timestamp').first()
			
			unread_count = Message.objects.filter(
				sender=user,
				recipient=request.user,
				is_read=False
			).count()
			
			user_list.append({
				'user': user,
				'last_message': last_message,
				'unread_count': unread_count
			})
		
		# Sort by last message timestamp
		user_list.sort(
			key=lambda x: x['last_message'].timestamp if x['last_message'] else timezone.now(),
			reverse=True
		)
		
		return render(request, 'chat/index.html', {
			'user_list': user_list
		})


@method_decorator(login_required, name='dispatch')
class ChatView(View):
	"""Chat view for private messaging with a specific user."""
	
	def get(self, request, username):
		other_user = get_object_or_404(User, username=username)
		
		# Mark messages as read
		Message.objects.filter(
			sender=other_user,
			recipient=request.user,
			is_read=False
		).update(is_read=True)
		
		# Get message history
		messages_list = Message.objects.filter(
			Q(sender=request.user, recipient=other_user) |
			Q(sender=other_user, recipient=request.user)
		).order_by('timestamp')
		
		return render(request, 'chat/chat.html', {
			'other_user': other_user,
			'messages': messages_list
		})


@method_decorator(login_required, name='dispatch')
class UserListView(View):
	"""View all users."""
	
	def get(self, request):
		users = User.objects.exclude(id=request.user.id)
		return render(request, 'chat/user_list.html', {'users': users})
