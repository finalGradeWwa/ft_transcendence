from .models import Plant

def create_plant(*, creator, data):
    allowed_fields = {
        "nickname",
        "garden",
        "species",
    }

    clean_data = {
        key: value
        for key, value in data.items()
        if key in allowed_fields
    }

    return Plant.objects.create(
        owner=creator,
        **clean_data
    )
