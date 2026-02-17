from .models import Plant
from django.core.exceptions import ValidationError

def create_plant(*, creator, data):
    allowed_fields = {"nickname", "garden", "species", "image"}

    # Only include allowed fields
    clean_data = {key: value for (key, value) in data.items() if key in allowed_fields}

    garden_obj = clean_data.pop("garden", None)  # Remove garden from clean_data

    if garden_obj:
        # Check permission: user must be a member of the garden
        if not garden_obj.gardenuser_set.filter(user=creator).exists():
            raise ValidationError("You don't have permission to create plants in this garden.")

    # Create plant with explicit garden object
    return Plant.objects.create(
        owner=creator,
        garden=garden_obj,
        **clean_data
    )
