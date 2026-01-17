from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.contrib.auth import get_user_model
from django.core.exceptions import ValidationError
from plants.models import Plant

def create_post(*, creator, data):
    allowed_fields = {
        "description",
        "plant",
        "image",
    }

    clean_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    plant_id = clean_data.get("plant")
    if plant_id:
        plant = get_object_or_404(Plant, id=plant_id)
        if plant.owner != creator:
            raise ValidationError("You don't have permission to create plants in this garden.")

    return Plant.objects.create(
        owner=creator,
        **clean_data
    )