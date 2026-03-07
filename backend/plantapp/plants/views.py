from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
from rest_framework.response import Response
from rest_framework.exceptions import PermissionDenied
from django.shortcuts import get_object_or_404

from .models import Plant
from .serializers import PlantSerializer, PlantListSerializer, PlantCreateSerializer
from .services import create_plant


class PlantViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]

    def _check_plant_permission(self, plant, user):
        """
        Helper: Checks if user is a member of the plant's garden.
        """
        if not plant.garden.gardenuser_set.filter(user=user).exists():
            raise PermissionDenied("You must be a member of this plant's garden to perform this action")

    def list(self, request):
        garden_id = request.query_params.get("garden")
        owner_param = request.query_params.get("owner")
        username_param = request.query_params.get("username")

        # Base query: Plants in gardens where I am a member
        plants = Plant.objects.filter(
            garden__gardenuser__user=request.user
        ).select_related('owner', 'garden').distinct()

        if garden_id:
            plants = plants.filter(garden_id=garden_id)

        if owner_param:
            if owner_param.lower() == "me":
                plants = plants.filter(owner=request.user)
            else:
                plants = plants.filter(owner_id=owner_param)

        if username_param:
            plants = plants.filter(owner__username=username_param)

        serializer = PlantListSerializer(plants, many=True, context={"request": request})
        return Response(serializer.data)

    def retrieve(self, request, pk=None):
        plant = get_object_or_404(Plant, pk=pk)
        # Note: We might want to check visibility here too, but retrieve is often looser
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
        plant = get_object_or_404(Plant, pk=pk)
        self._check_plant_permission(plant, request.user)
        plant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    def update(self, request, pk=None):
        plant = get_object_or_404(Plant, pk=pk)
        self._check_plant_permission(plant, request.user)
        serializer = PlantCreateSerializer(
            plant,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PlantSerializer(serializer.instance).data)

    def partial_update(self, request, pk=None):
        plant = get_object_or_404(Plant, pk=pk)
        self._check_plant_permission(plant, request.user)
        serializer = PlantCreateSerializer(
            plant,
            data=request.data,
            context={"request": request},
            partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PlantSerializer(serializer.instance).data)
