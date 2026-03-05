from django.shortcuts import get_object_or_404
from django.db.models import Count
from django.contrib.auth import get_user_model
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from rest_framework.decorators import action
from rest_framework.exceptions import PermissionDenied, ValidationError

from .models import Garden, GardenUser, GardenOwner
from .services import create_garden, add_garden_user
from .serializers import (
    GardenListSerializer,
    GardenContentSerializer,
    GardenCreateSerializer
)
from plants.services import create_plant
from plants.serializers import PlantSerializer, PlantCreateSerializer

# Create your views here.

User = get_user_model()

class GardenViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _get_detailed_gardens(self):
        """
        Helper: Returns Garden QuerySet with annotations and prefetches.
        """
        return (
            Garden.objects
            .annotate(user_count=Count("gardenuser", distinct=True))
            .annotate(plant_count=Count("plants", distinct=True))
            .prefetch_related("owners__organization_user__user")
        )

    def _check_is_owner(self, garden, user):
        """
        Helper: Returns Garden QuerySet with annotations and prefetches.
        """
        if not GardenOwner.objects.filter(
            organization=garden,
            organization_user__user=user
        ).exists():
            raise PermissionDenied("You are not a garden owner")


    # GET /api/garden/{id}/
    def retrieve(self, request, pk):
        """
        Retrieve a single garden details.
        Visible to all authenticated users (public read).
        """
        queryset = self._get_detailed_gardens()
        garden = get_object_or_404(queryset, pk=pk)
        serializer = GardenContentSerializer(garden, context={"request": request})
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

    # GET /api/garden/
    # Query Params: ?owner=me | ?owner={id} | ?username={name} | ?member={username}
    def list(self, request):
        """
        List gardens visible to the current user (where user is owner OR member).
        """
        # 1. Base Query: Gardens where I am Owner OR Member
        # gardens = self._get_detailed_gardens().filter(
        #     Q(owners__organization_user__user=request.user) |
        #     Q(gardenuser__user=request.user)
        # ).distinct()
        gardens = self._get_detailed_gardens().distinct()

        # 2. Apply Filters
        owner_param = request.query_params.get("owner")
        username_param = request.query_params.get("username")
        member_param = request.query_params.get("member")

        # Filter by Owner
        if owner_param:
            if owner_param.lower() == "me":
                gardens = gardens.filter(owners__organization_user__user=request.user)
            else:
                # Assuming owner_param is an ID here for consistency
                gardens = gardens.filter(owners__organization_user__user_id=owner_param)

        # Filter by Owner's Username
        if username_param:
            gardens = gardens.filter(owners__organization_user__user__username=username_param)

        # Filter by Member (finding shared gardens)
        if member_param:
            # Note: 'member=me' is redundant as base query already limits to my gardens.
            # This is useful for: "Gardens where I am a member AND 'Alice' is also a member"
            gardens = gardens.filter(gardenuser__user__username=member_param)

        serializer = GardenListSerializer(gardens, many=True, context={'request': request})
        return Response(serializer.data)

    def destroy(self, request, pk):
        """
        Delete a garden. Only garden owners can delete.
        """
        garden = get_object_or_404(Garden, pk=pk)
        self._check_is_owner(garden, request.user)
        garden.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, pk=None):
        """
        Update a garden (PUT). Only garden owners can update.
        """
        garden = get_object_or_404(Garden, pk=pk)
        self._check_is_owner(garden, request.user)

        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(GardenListSerializer(serializer.instance, context={'request': request}).data)


    def partial_update(self, request, pk=None):
        """
        Update a garden (PATCH). Only garden owners can update.
        """
        garden = get_object_or_404(Garden, pk=pk)
        self._check_is_owner(garden, request.user)

        serializer = GardenCreateSerializer(
            garden,
            data=request.data,
            context={"request": request},
            partial=True
        )
        serializer.is_valid(raise_exception=True)
        serializer.save()
        return Response(GardenListSerializer(serializer.instance, context={'request': request}).data)

    # POST /api/garden/{id}/add_user/
    @action(detail=True, methods=["post"])
    def add_user(self, request, pk=None):
        """
        Add a user to a garden. Only garden owners can add users.
        """
        garden = get_object_or_404(Garden, pk=pk)
        self._check_is_owner(garden, request.user)

        user_id = request.data.get("user_id")
        if not user_id:
            raise ValidationError({"detail": "user_id is required"})

        user_to_add = get_object_or_404(User, pk=user_id)

        add_garden_user(
            owner=request.user,
            garden=garden,
            user_to_add=user_to_add,
        )

        return Response(
            {
                "detail": "New garden member has been added.",
                "garden_id": garden.id,
                "added_user_id": user_id,
            },
            status=status.HTTP_200_OK
        )

    # DELETE /api/garden/{id}/remove_user/
    @action(detail=True, methods=["delete"], url_path="remove_user")
    def remove_user(self, request, pk=None):
        """
        Remove a user from a garden. Only garden owners can remove users.
        """
        garden = get_object_or_404(Garden, pk=pk)
        self._check_is_owner(garden, request.user)

        user_id = request.data.get("user_id")
        if not user_id:
            raise ValidationError({"detail": "user_id is required"})

        garden_user = get_object_or_404(GardenUser, organization=garden, user_id=user_id)
        garden_user.delete()

        return Response(status=status.HTTP_204_NO_CONTENT)

    # POST /api/garden/{id}/add_plant/
    @action(detail=True, methods=["post"], url_path="add_plant")
    def add_plant(self, request, pk=None):
        """
        Add a plant to this garden. Only garden members can add plants.
        """
        garden = get_object_or_404(Garden, pk=pk)

        # Check membership (Owner is also a member via GardenUser)
        if not GardenUser.objects.filter(organization=garden, user=request.user).exists():
            raise PermissionDenied("You must be a member of this garden to add plants")

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
