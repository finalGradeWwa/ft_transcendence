from rest_framework.response import Response
from rest_framework.permissions import IsAuthenticated, AllowAny
from django.shortcuts import get_object_or_404
from rest_framework import status
from django.contrib.auth import get_user_model

def create_post(*, creator, data):
    allowed_fields = {
        "nickname",
        "plant",
        "species",
    }

    clean_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    garden_id = clean_data.get("garden")
    if garden_id:
        garden = get_object_or_404(Garden, id=garden_id)
        if garden.owner != creator:
            raise ValidationError("You don't have permission to create plants in this garden.")

    return Plant.objects.create(
        owner=creator,
        **clean_data
    )