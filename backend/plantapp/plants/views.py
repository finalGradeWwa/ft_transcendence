from rest_framework import viewsets, status
from rest_framework.permissions import AllowAny
from rest_framework.response import Response
from rest_framework.authentication import SessionAuthentication
from rest_framework_simplejwt.authentication import JWTAuthentication
from django.shortcuts import get_object_or_404

from .models import Plant
from .serializers import PlantSerializer, PlantListSerializer, PlantCreateSerializer
from .services import create_plant


class PlantViewSet(viewsets.ViewSet):
    authentication_classes = [JWTAuthentication, SessionAuthentication]
    permission_classes = [AllowAny]
    queryset = Plant.objects.all()

    def list(self, request):
        """
        List all plants. Optionally filter by garden, owner or username.
        Use ?owner=me to see your own plants, ?owner=<user_id> to see a specific user's plants,
        or ?username=<username> to filter by username.
        """
        garden_id = request.query_params.get("garden")
        owner_param = request.query_params.get("owner")
        username_param = request.query_params.get("username")

        plants = Plant.objects.all()

        if garden_id:
            plants = plants.filter(garden_id=garden_id)

        if owner_param:
            if owner_param.lower() == "me":
                plants = plants.filter(owner=request.user)
            else:
                plants = plants.filter(owner_id=owner_param)

        if username_param:
            plants = plants.filter(owner__username=username_param)

        serializer = PlantListSerializer(plants, many=True)
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        """
        Retrieve a single plant (visible to all authenticated users).
        """
        plant = get_object_or_404(Plant, pk=pk)
        serializer = PlantSerializer(plant)
        return Response(serializer.data)

    def create(self, request):
        serializer = PlantCreateSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)

        plant = create_plant(
            creator=request.user,
            data=serializer.validated_data
        )

        return Response(
            {
                "detail": f"Your plant {plant.plant_id} has been added.",
                "plant": PlantSerializer(plant).data,
            },
            status=status.HTTP_201_CREATED,
        )

    def destroy(self, request, pk=None):
        """
        Delete a plant. Only garden members can delete.
        """
        plant = get_object_or_404(Plant, pk=pk)
        if not plant.garden.gardenuser_set.filter(user=request.user).exists():
            return Response(
                {"detail": "You must be a member of this plant's garden to delete it"},
                status=status.HTTP_403_FORBIDDEN,
            )
        plant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, pk=None):
        """
        Update a plant (PUT). Only garden members can update.
        """
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        plant = get_object_or_404(Plant, pk=pk)
        if not plant.garden.gardenuser_set.filter(user=request.user).exists():
            return Response(
                {"detail": "You must be a member of this plant's garden to update it"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = PlantCreateSerializer(
            plant,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PlantSerializer(serializer.instance).data)

    def partial_update(self, request, pk=None):
        """
        Update a plant (PATCH). Only garden members can update.
        """
        if not request.user.is_authenticated:
            return Response(status=status.HTTP_401_UNAUTHORIZED)
        plant = get_object_or_404(Plant, pk=pk)
        if not plant.garden.gardenuser_set.filter(user=request.user).exists():
            return Response(
                {"detail": "You must be a member of this plant's garden to update it"},
                status=status.HTTP_403_FORBIDDEN,
            )
        serializer = PlantCreateSerializer(
            plant,
            data=request.data,
            context={"request": request},
            partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PlantSerializer(serializer.instance).data)