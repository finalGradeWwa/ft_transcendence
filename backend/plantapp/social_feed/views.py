from rest_framework.permissions import IsAuthenticated
from rest_framework import viewsets, status
from rest_framework.response import Response
from rest_framework.decorators import action
from django.shortcuts import get_object_or_404
from django.db.models import Q
from rest_framework.parsers import FormParser, MultiPartParser
from .serializers import PinWriteModeSerializer, PinDetailReadModeSerializer, PinListReadModeSerializer
from .services import create_pin
from .models import Pin

class PinViewSet(viewsets.ViewSet):

    permission_classes = [IsAuthenticated]
    parser_classes = (MultiPartParser, FormParser)

    def create(self, request):
        serializer = PinWriteModeSerializer(
            data=request.data,
            context={"request": request}
        )
        serializer.is_valid(raise_exception=True)
        pin = create_pin(
            creator=request.user,
            data=serializer.validated_data
        )
        serializer = PinDetailReadModeSerializer(pin)
        return Response(
            {
            "detail": f"added new pin!",
            "pin": serializer.data
            },
            status=status.HTTP_201_CREATED,
        )

    def retrieve(self, request, pk=None):
        pin = get_object_or_404(Pin, pk=pk)
        serializer = PinDetailReadModeSerializer(pin)
        return Response(serializer.data)

    def list(self, request):
        """
        List all pins (visible to all authenticated users).
        Optionally filter by owner using ?owner=me or ?owner=<user_id>
        """
        owner_param = request.query_params.get("owner")
        
        pins = Pin.objects.all().order_by('-created_at')
        
        if owner_param:
            if owner_param.lower() == "me":
                pins = pins.filter(creator=request.user)
            else:
                pins = pins.filter(creator_id=owner_param)
        
        serializer = PinListReadModeSerializer(pins, many=True)
        return Response(serializer.data)

    @action(detail=False, methods=['get'], url_path='feed')
    def feed(self, request):
        """
        Get personalized feed: pins from users you follow + your own pins.
        GET /api/pins/feed/
        """
        # Get IDs of users the current user follows
        following_ids = request.user.following.values_list('id', flat=True)
        
        # Get pins from followed users OR from the current user
        pins = Pin.objects.filter(
            Q(creator__in=following_ids) | Q(creator=request.user)
        ).order_by('-created_at')
        
        serializer = PinListReadModeSerializer(pins, many=True)
        return Response(serializer.data)

    def destroy(self, request, pk):
        pin = get_object_or_404(Pin, pk=pk, creator=request.user)
        pin.delete()
        return Response(
            { "detail": f"your Pin has been deleted." },
            status=status.HTTP_204_NO_CONTENT
            )

    def update(self, request, pk):
        pin = get_object_or_404(
            Pin,
            pk=pk,
            creator=request.user
        )
        serializer = PinWriteModeSerializer(
            pin,
            data=request.data,
            context={"request": request},
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PinDetailReadModeSerializer(serializer.instance).data)
    
    def partial_update(self, request, pk=None):
        pin = get_object_or_404(
            Pin,
            pk=pk,
            creator=request.user
        )
        serializer = PinWriteModeSerializer(
            pin,
            data=request.data,
            context={"request": request},
            partial=True
        )
        if serializer.is_valid(raise_exception=True):
            serializer.save()
        return Response(PinDetailReadModeSerializer(serializer.instance).data)