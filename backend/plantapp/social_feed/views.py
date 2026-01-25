# from django.contrib.auth.models import User
from django.shortcuts import get_object_or_404
from rest_framework.permissions import IsAuthenticated, AllowAny
from rest_framework import viewsets
from rest_framework.response import Response
from .models import Post
from .permissions import IsAuthorOrReadOnly
from rest_framework.parsers import FormParser, MultiPartParser

# TODO: Implement a PostViewSet for handling Post objects.
# Design notes (for future implementation):
# - Use a ModelViewSet subclass with IsAuthorOrReadOnly permissions.
# - Configure queryset to return all Post instances.
# - Support multipart/form-data uploads via MultiPartParser and FormParser.