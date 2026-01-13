from .models import Garden, GardenUser, GardenOwner
from rest_framework.views import APIView
from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated
from django.shortcuts import get_object_or_404
from rest_framework import status
from .services import create_garden, add_garden_user
from .serializers import GardenListSerializer, GardenContentSerializer
from django.db.models import Count
from django.contrib.auth import get_user_model

# Create your views here.

User = get_user_model()
    
class GardenAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def get(self, request, pk):
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


    def post(self, request):
        garden = create_garden(
            creator=request.user,
            data=request.data
        )
        return Response(
            {"detail": f"your new {garden.garden_name} garden has been created."},
            status=status.HTTP_201_CREATED,
        )

    def delete(self, request, pk):
        garden = get_object_or_404(
            Garden,
            pk=pk,
            owners__organization_user__user=request.user)
        garden.delete()
        return Response(status=status.HTTP_204_NO_CONTENT)


class ListMyGardens(APIView):
    permission_classes = [IsAuthenticated]
    serializer_class = GardenListSerializer

    def get(self, request):
        gardens = (
            Garden.objects
            .filter(gardenuser__user=request.user)
            .annotate(user_count=Count("gardenuser"))
        )

        serializer = self.serializer_class(gardens, many=True)
        return Response(serializer.data)

class AddGardenUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def post(self, request, pk):
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

class RemoveGardenUserAPIView(APIView):
    permission_classes = [IsAuthenticated]

    def delete(self, request, pk):
        garden_user = get_object_or_404(GardenUser, pk=pk)

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
