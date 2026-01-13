from .models import Plant
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from .services import create_plant
from .serializers import PlantSerializer, PlantListSerializer


# Create your views here.

class PlantAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user # permission check
        )
        serializer = PlantSerializer(plant)
        return Response(serializer.data)
    
    def post(self, request, pk=None):
        if pk is not None:
            return Response(
                {"detail": "Cannot POST to a specific plant."},
                status=status.HTTP_400_BAD_REQUEST
            )

        plant = create_plant(
            creator=request.user,
            data=request.data
        )

        serializer = PlantSerializer(plant)
        return Response(
            {
                "detail": f"Your plant {plant.plant_id} has been added.",
                "plant": serializer.data,
            },
            status=status.HTTP_201_CREATED,
        )


    def delete(self, request, pk):
        plant = get_object_or_404(
            Plant,
            pk=pk,
            garden__gardenuser__user=request.user # permission check
        )
        plant.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)

class ListMyPlants(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = PlantListSerializer

    def get(self, request):
        plants = Plant.objects.filter(
            garden__gardenuser__user=request.user
        )
        serializer = self.serializer_class(plants, many=True)
        return Response(serializer.data)
