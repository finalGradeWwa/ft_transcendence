from .models import Garden, GardenUser, GardenOwner
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated,IsAuthenticatedOrReadOnly
from django.shortcuts import get_object_or_404
from rest_framework import viewsets, status
from rest_framework.decorators import action
from .services import create_garden, add_garden_user
from .serializers import GardenListSerializer, GardenContentSerializer, GardenCreateSerializer
from django.db.models import Count
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()
    
class GardenViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /gardens/5/
    def retrieve(self, request, pk):
        """
        Retrieve a single garden (visible to all authenticated users).
        """
        garden = get_object_or_404(
            Garden.objects # queryset chaining happens below
            .annotate(user_count=Count("gardenuser")) # responsible for returning number of garden users
            .prefetch_related( # responsible for returning garden's owner
                "owners__organization_user__user"
            ),
            pk=pk,
        )
        serializer = GardenContentSerializer(garden)
        return Response(serializer.data)

    # POST /gardens/
    def create(self, request):
        serializer = GardenCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        
        garden = create_garden(
            creator=request.user,
            data=serializer.validated_data
        )
        return Response(
        {
            "detail": f"Your new {garden.name} garden has been created.",
            "garden_id": garden.id,
        },
            status=status.HTTP_201_CREATED,
        )

    # GET /api/garden/?owner=42
    # GET /api/garden/?owner=me
    def list(self, request):
        """
        List all gardens (visible to all authenticated users).
        """
        owner_param = request.query_params.get("owner")

        gardens = (
            Garden.objects
                .distinct()
                .annotate(user_count=Count("gardenuser"))
        )
        if owner_param:
            if owner_param.lower() == "me":
                gardens = gardens.filter(owners__organization_user__user=request.user)
            else:
                gardens = gardens.filter(owners__organization_user__user_id=owner_param)
        serializer = GardenListSerializer(gardens, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk):
        """
        Delete a garden. Only garden owners can delete.
        """
        garden = get_object_or_404(
            Garden,
            pk=pk,
            owners__organization_user__user=request.user)
        garden.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)
    
    def update(self, request, pk=None):
        """
        Update a plant (PUT). Only garden owners can update.
        """
        garden = get_object_or_404(
            Garden,
            pk=pk,
            owners__organization_user__user=request.user
        )
        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(GardenListSerializer(serializer.instance).data)

    def partial_update(self, request, pk=None):
        """
        Update a plant (PATCH). Only garden members can update.
        """
        garden = get_object_or_404(
            Garden,
            pk=pk,
            owners__organization_user__user=request.user
        )
        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
            partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(GardenListSerializer(serializer.instance).data) 
    
    # POST /gardens/5/users/
    @action(detail=True, methods=["post"])
    def add_user(self, request, pk=None):
        """
        Add a user to a garden. Only garden owners can add users.
        """
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
        return Response(
        {  
            "detail": f"new garden member has been added.",
            "garden_id": garden.id,
            "added_user_id": user_id,
        },
        status=status.HTTP_200_OK
       )

    # DELETE /gardens/5/users/12/
    @action(detail=True, methods=["delete"], url_path="users/(?P<user_pk>[^/.]+)")
    def remove_user(self, request, pk=None, user_pk=None):
        """
        Remove a user from a garden. Only garden owners can remove users.
        """
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

   # POST /gardens/5/users/
    @action(detail=True, methods=["post"])
    def add_plant(self, request, pk=None):
        """
        create and add a plant to a garden. members and owners only
        """
        garden = get_object_or_404(Garden, pk=pk)
        

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
        return Response(
        {  
            "detail": f"new garden member has been added.",
            "garden_id": garden.id,
            "added_user_id": user_id,
        },
        status=status.HTTP_200_OK
       )
