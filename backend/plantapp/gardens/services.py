from .models import Garden, GardenOwner, GardenUser
from rest_framework.response import Response
from django.shortcuts import get_object_or_404
from rest_framework import status

def create_garden(*, creator, data):
    garden = Garden.objects.create(
        name=data["garden_name"],
        garden_name=data["garden_name"],
    )
    garden_user = GardenUser.objects.create(
        organization=garden,
        user=creator
    )
    GardenOwner.objects.create(
        organization=garden,
        organization_user=garden_user
    )
    return garden

from django.shortcuts import get_object_or_404
from gardens.models import GardenUser, GardenOwner


def add_garden_user(*, owner, garden, user_to_add):
    if not GardenOwner.objects.filter(
        organization=garden,
        organization_user__user=owner
    ).exists():
        raise PermissionError("User is not a garden owner")

    garden_user, created = GardenUser.objects.get_or_create(
        organization=garden,
        user=user_to_add,
    )
    return garden_user
