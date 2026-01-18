# from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Post
from .permissions import IsAuthorOrReadOnly
from rest_framework.parsers import FormParser, MultiPartParser

# TO BE CONTINUED 
# class PostViewSet(viewsets.ModelViewSet):
# 	permission_classes = [IsAuthorOrReadOnly]
# 	queryset = Post.objects.all()
# 	parser_classes = [MultiPartParser, FormParser]
	
# 	def post(self, request):
		