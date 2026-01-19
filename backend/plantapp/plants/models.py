from django.db import models
from django.utils import timezone
from django.conf import settings

class Plant(models.Model):

    owner = models.ForeignKey(
        settings.AUTH_USER_MODEL,
        on_delete=models.CASCADE, 
        related_name="plants",
    )
    image = models.ImageField(upload_to='plant-images/', null=True, blank=True)
    plant_id = models.AutoField(primary_key=True)
    species = models.CharField(max_length=25, blank=True, null=True)
    garden = models.ForeignKey(
        'gardens.Garden', 
        related_name="plants",
        on_delete=models.SET_NULL,
        null=True,
        blank=True,
        )
    nickname = models.CharField(max_length=25, unique=True)
    created_at = models.DateTimeField(default=timezone.now)

    def __str__(self):
        return self.nickname