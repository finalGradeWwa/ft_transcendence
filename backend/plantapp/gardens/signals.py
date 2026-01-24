from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Garden, GardenUser, GardenOwner

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_garden(sender, instance, created, **kwargs):

    """
    Django signal receiver that creates a default garden for new users.
    This is triggered on the post_save signal of the User model. When a new
    user instance is created (i.e., created is True), it:
      * creates a private Garden named after the user's username,
      * creates a GardenUser entry linking the user to that garden, and
      * creates a GardenOwner entry making the user the owner of the garden.
    """
    if created:
        # Create the garden
        garden = Garden.objects.create(
            name=f"{instance.username}'s Garden",
            environment='I',  # Default to indoor
        )
        
        # Add the user to the garden
        garden_user = GardenUser.objects.create(
            organization=garden,
            user=instance,
        )
        
        # Make the user the owner
        GardenOwner.objects.create(
            organization=garden,
            organization_user=garden_user,
        )
