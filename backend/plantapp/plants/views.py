from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated, IsAuthenticatedOrReadOnly
from rest_framework.response import Response
from django.shortcuts import get_object_or_404

from .models import Plant
from .serializers import PlantSerializer, PlantListSerializer, PlantCreateSerializer
from .services import create_plant


class PlantViewSet(viewsets.ViewSet):
    permission_classes = [IsAuthenticated]
    queryset = Plant.objects.all()

    # GET /api/plant/
    # GET /api/plant/?garden=3
    def list(self, request):
        """
        List plants the user has access to.
        Optionally filter by garden.
        """
        garden_id = request.query_params.get("garden")

        plants = Plant.objects.filter(
            garden__gardenuser__user=request.user
        )

        if garden_id:
            plants = plants.filter(garden_id=garden_id)

        serializer = PlantListSerializer(plants, many=True)
        return Response(serializer.data)

    # GET /api/plant/5/
    def retrieve(self, request, pk=None):
        """
        Retrieve a single plant if the user is a member of its garden.
        """
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user.id
        )

        serializer = PlantSerializer(plant)
        return Response(serializer.data)

    # POST /api/plant/
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

    # DELETE /api/plant/5/
    def destroy(self, request, pk=None):
        """
        Delete a plant if the user has access to its garden.
        """
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user
        )
        plant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

    # PUT /api/plant/5/ 
    def update(self, request, pk=None):
        """
        Update a plant (PUT). User must have access to its garden.
        """
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user
        )
        serializer = PlantCreateSerializer(
            plant,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PlantSerializer(serializer.instance).data)
    
    # PATCH /api/plant/5/
    def partial_update(self, request, pk=None):
        """
        Update a plant (PATCH). User must have access to its garden.
        """
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user
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