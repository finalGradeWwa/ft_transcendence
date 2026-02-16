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
from plants.services import create_plant
from plants.serializers import PlantSerializer, PlantCreateSerializer

# Create your views here.

User = get_user_model()
    
class GardenViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    # GET /api/garden/{id}/
    def retrieve(self, request, pk):
        """
        Retrieve a single garden (visible to all authenticated users).
        """
        garden = get_object_or_404(
            Garden.objects # queryset chaining happens below
            .annotate(user_count=Count("gardenuser")) # responsible for returning number of garden users
            .annotate(plant_count=Count("plants"))
            .prefetch_related( # responsible for returning garden's owner
                "owners__organization_user__user"
            ),
            pk=pk,
        )
        serializer = GardenContentSerializer(garden)
        return Response(serializer.data)

    # POST /api/garden/
    def create(self, request):
        serializer = GardenCreateSerializer(data=request.data)
        serializer.is_valid(raise_exception=True)
        garden = create_garden(
            creator=request.user,
            data=serializer.validated_data
        )
        return Response(
        {
            "detail": f"Your new garden named {garden.name} has been created.",
            "garden_id": garden.id,
        },
            status=status.HTTP_201_CREATED,
        )

    # GET /api/garden/?owner={id}
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
                .annotate(plant_count=Count("plants"))
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
        garden = get_object_or_404(Garden, pk=pk)
        if not GardenOwner.objects.filter(
            organization=garden,
            organization_user__user=request.user
        ).exists():
            return Response(
                {"detail": "You are not a garden owner"},
                status=status.HTTP_403_FORBIDDEN,
            )
        garden.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, pk=None):
        """
        Update a garden (PUT). Only garden owners can update.
        """
        garden = get_object_or_404(Garden, pk=pk)  
        if not GardenOwner.objects.filter(
            organization=garden,
            organization_user__user=request.user
        ).exists():
            return Response(
                {"detail": "You are not a garden owner"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(GardenListSerializer(serializer.instance).data)

    def partial_update(self, request, pk=None):
        """
        Update a garden (PATCH). Only garden owners can update.
        """
        garden = get_object_or_404(Garden, pk=pk)     
        if not GardenOwner.objects.filter(
            organization=garden,
            organization_user__user=request.user
        ).exists():
            return Response(
                {"detail": "You are not a garden owner"},
                status=status.HTTP_403_FORBIDDEN
            )
        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(GardenListSerializer(serializer.instance).data) 
    
    # POST /api/garden/{id}/add_user/
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

    # DELETE /api/garden/{id}/remove_user/{user_id}/
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

    # POST /api/garden/{id}/add_plant/
    @action(detail=True, methods=["post"], url_path="add_plant")
    def add_plant(self, request, pk=None):
        """
        Add a plant to this garden. Only garden members can add plants.
        """
        garden = get_object_or_404(Garden, pk=pk)   
        if not GardenUser.objects.filter(organization=garden, user=request.user).exists():
            return Response(
                {"detail": "You must be a member of this garden to add plants"},
                status=status.HTTP_403_FORBIDDEN,
            )
        # Prepare data with garden from URL
        data = request.data.copy()
        data['garden'] = garden.id
        serializer = PlantCreateSerializer(
            data=data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        plant = create_plant(
            creator=request.user,
            data=serializer.validated_data
        )
        return Response(
            {
                "detail": f"Plant {plant.nickname} has been added to {garden.name}.",
                "plant": PlantSerializer(plant).data,
            },
            status=status.HTTP_201_CREATED,
        )