from .models import Garden, GardenUser, GardenOwner
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from .services import create_garden, add_garden_user
from .serializers import GardenListSerializer, GardenContentSerializer
from django.db.models import Count
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()
    
class GardenViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /gardens/5/
    def retrieve(self, request, pk):
        garden = get_object_or_404(
            Garden.objects # queryset chaining happens below
            .annotate(user_count=Count("gardenuser")) # responsible for returning number of garden users
            .prefetch_related( # responsible for returning garden's owner
                "owners__organization_user__user"
            ),
            pk=pk,
            gardenuser__user=request.user,
        )
        serializer = GardenContentSerializer(garden)
        return Response(serializer.data)


    def create(self, request):
        garden = create_garden(
            creator=request.user,
            data=request.data
        )
        return Response(
        {
            "detail": f"Your new {garden.garden_name} garden has been created.",
            "garden_id": garden.id,
        },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk):
        garden = get_object_or_404(
            Garden,
            pk=pk,
            owners__organization_user__user=request.user)
        garden.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def list(self, request):
        gardens = (
            Garden.objects
                .filter(gardenuser__user=request.user)
                .distinct()
                .annotate(user_count=Count("gardenuser"))
        )
        serializer = GardenListSerializer(gardens, many=True)
        return Response(serializer.data)
    
    # POST /gardens/5/users/
    @action(detail=True, methods=["post"])
    def add_user(self, request, pk=None):
        garden = get_object_or_404(Garden, pk=pk)
        user_id = request.data.get("user_id")

        if not user_id:
            return Response(
                {"detail": "user_id is required"},
                status=status.HTTP_400_BAD_REQUEST,
            )

        user_to_add = get_object_or_404(User, pk=user_id)

        try:
            add_garden_user(
                owner=request.user,
                garden=garden,
                user_to_add=user_to_add,
            )
        except PermissionError:
            return Response(
                {"detail": "You are not a garden owner"},
                status=status.HTTP_403_FORBIDDEN,
            )

        return Response(status=status.HTTP_201_CREATED)


    # DELETE /gardens/5/users/12/
    @action(detail=True, methods=["delete"], url_path="users/(?P<user_pk>[^/.]+)")
    def remove_user(self, request, pk=None, user_pk=None):
        garden_user = get_object_or_404(
            GardenUser,
            pk=user_pk,
            organization_id=pk,
        )

        if not GardenOwner.objects.filter(
            organization=garden_user.organization,
            organization_user__user=request.user,
        ).exists():
            return Response(
                {"detail": "You are not a garden owner"},
                status=status.HTTP_403_FORBIDDEN,
            )

        garden_user.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
