from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework.parsers import FormParser, MultiPartParser
from .serializers import PostWriteModeSerializer, PostDetailReadModeSerializer, PostListReadModeSerializer
from .services import create_post
from .models import Post


# TODO: Implement a PostViewSet for handling Post objects.
# Design notes (for future implementation):
# - Use a ModelViewSet subclass with IsAuthorOrReadOnly permissions.
# - Configure queryset to return all Post instances.
# - Support multipart/form-data uploads via MultiPartParser and FormParser.
# - optional correlation with a plant 
# - correlation with a garden

class PostViewSet(viewsets.ViewSet):

    serializer_class = PostDetailReadModeSerializer
    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request):
        serializer = PostWriteModeSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        post = create_post(
            creator=request.user,
            data=serializer.validated_data
        )
        serializer = PostDetailReadModeSerializer(post)
        return Response(
            {
            "detail": f"Your post {post.id} has been added.",
            "post": serializer.data
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        post = get_object_or_404(Post, pk=pk)
        serializer = PostDetailReadModeSerializer(post)
        return Response(serializer.data)

    def list(self, request):
        posts = Post.objects.filter(
            creator=request.user
        )
        serializer = PostListReadModeSerializer(posts, many=True)
        return Response(serializer.data)
    
