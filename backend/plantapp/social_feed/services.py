from .models import Pin

def create_pin(creator, data):

    pin = Pin.objects.create(
        creator=creator,
        content=data.get("content"),
        image=data.get("image"),
        garden=data.get("garden"),
        plant=data.get("plant")
    )
    # print(f"Created post: {post}")  # Uses __str__()
    return pin