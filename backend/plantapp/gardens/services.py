from .models import Garden, GardenOwner, GardenUser

def create_garden(*, creator, data):
    garden = Garden.objects.create(
        name=data["name"],
        environment=data.get("environment", "I"),
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
