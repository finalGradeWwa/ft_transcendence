from rest_framework import viewsets, status
from rest_framework.permissions import IsAuthenticated
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
    # GET /api/plant/?owner=5
    # GET /api/plant/?owner=me
    def list(self, request):
        """
        List all plants. Optionally filter by garden or owner.
        Use ?owner=me to see your own plants, or ?owner=<user_id> to see a specific user's plants.
        """
        garden_id = request.query_params.get("garden")
        owner_param = request.query_params.get("owner")

        plants = Plant.objects.all()

        if garden_id:
            plants = plants.filter(garden_id=garden_id)
        
        if owner_param:
            if owner_param.lower() == "me":
                plants = plants.filter(owner=request.user)
            else:
                plants = plants.filter(owner_id=owner_param)

        serializer = PlantListSerializer(plants, many=True)
        return Response(serializer.data)

    # GET /api/plant/5/
    def retrieve(self, request, pk=None):
        """
        Retrieve a single plant (visible to all authenticated users).
        """
        plant = get_object_or_404(Plant, pk=pk)

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
        Delete a plant. Only garden members can delete.
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
        Update a plant (PUT). Only garden members can update.
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
        Update a plant (PATCH). Only garden members can update.
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