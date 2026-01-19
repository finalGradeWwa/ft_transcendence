from django.db import models
from organizations.models import Organization
from organizations.base import (
    OrganizationUserBase,
    OrganizationOwnerBase,
    OrganizationInvitationBase,
)
from django.conf import settings

# Create your models here.

# hide private gardens unless member
class GardenQuerySet(models.QuerySet):
    def visible_to(self, user):
        return self.filter(
            models.Q(is_public=True) |
            models.Q(gardenuser__user=user)
        )

class GardenEnv(models.TextChoices):
    INDOOR = "I", "indoor",
    OUTDOOR = "O", "outdoor",
    GREENHOUSE = "G", "greenhouse"

class Garden(Organization):
    garden_id = models.AutoField(primary_key=True)
    garden_name = models.CharField(max_length=30)
    environment = models.CharField(
        max_length=1,
        choices=GardenEnv.choices,
        default=GardenEnv.INDOOR,
    )
    is_public = models.BooleanField(default=False)
    objects = GardenQuerySet.as_manager()
    def __str__(self):
        return self.garden_name
    
class GardenUser(OrganizationUserBase):
    organization = models.ForeignKey(
        Garden,
        on_delete=models.CASCADE,
    )
    user = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        related_name="memberships",
        on_delete=models.CASCADE,
    )

    class Meta(OrganizationUserBase.Meta):
        pass


class GardenOwner(OrganizationOwnerBase):
    organization = models.ForeignKey(
        Garden,
        related_name="owners",
        on_delete=models.CASCADE,
    )
    organization_user = models.ForeignKey(
        GardenUser,
        related_name="ownerships",
        on_delete=models.CASCADE,
    )

class GardenInvitation(OrganizationInvitationBase):
    organization = models.ForeignKey(
        Garden,
        related_name="invitations",
        on_delete=models.CASCADE,
    )
