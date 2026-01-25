from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.parsers import FormParser, MultiPartParser
from .serializers import PostWriteModeSerializer, PostDetailReadModeSerializer
from .services import create_post


# TODO: Implement a PostViewSet for handling Post objects.
# Design notes (for future implementation):
# - Use a ModelViewSet subclass with IsAuthorOrReadOnly permissions.
# - Configure queryset to return all Post instances.
# - Support multipart/form-data uploads via MultiPartParser and FormParser.
# - optional correlation with a plant 
# - correlation with a garden

class PostViewSet(viewsets.ModelViewSet):

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
        return Response(
            {
                "detail": f"Your post {post.id} has been added.",
                "post": {
                    "id": post.id,
                    "content": post.content,
                    "garden": post.garden.id,
                    "plant": post.plant.id if post.plant else None,
                }
            },
            status=status.HTTP_201_CREATED,
        )
