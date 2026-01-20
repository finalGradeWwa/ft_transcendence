from django.db.models.signals import post_save
from django.dispatch import receiver
from django.contrib.auth import get_user_model
from .models import Garden, GardenUser, GardenOwner

User = get_user_model()

@receiver(post_save, sender=User)
def create_default_garden(sender, instance, created, **kwargs):

    if created:
        # Create the garden
        garden = Garden.objects.create(
            garden_name=f"{instance.username}'s Garden",
            environment='I',  # Default to indoor
            is_public=False,
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
