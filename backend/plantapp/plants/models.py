from django.db import models
from django.contrib.auth.models import User
from django.utils import timezone
from django.core.validators import MinValueValidator, MaxValueValidator
from django.conf import settings

# Create your models here.

class SoilType(models.TextChoices):
        CLAY = "C", "Clay"
        SAND = "SD", "Sand"
        SILT = "ST", "Silt"
        LOAM = "L", "Loam"
        PEAT = "P", "Peat"
        CHALK = "CH", "Chalk"
        DEFAULT = "D", "Default Soil"

class LightType(models.TextChoices):
    FULL_SUN = "FS", "Full sun"
    BRIGHT_SUN = "BS", "Bright sun"
    MEDIUM_LIGHT = "MD", "Medium light"
    LOW_LIGHT = "LL", "Low light"

class Plant(models.Model):

    owner = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)
    plant_id = models.AutoField(primary_key=True)
    # garden_id
    # species_id
    nickname = models.CharField()
    # photo_url
    soil_type_used = models.CharField(
        max_length=2,
        choices=SoilType.choices,
        default=SoilType.DEFAULT,
    )
    created_at = models.DateTimeField(default=timezone.now)
    current_ph = models.DecimalField(
        max_digits=4,
        decimal_places=2,
        validators=[MinValueValidator(0), MaxValueValidator(14)]
    )   
    current_temp_c = models.DecimalField(max_digits=4, decimal_places=2)
    current_moisture = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    current_humidity = models.IntegerField(
        validators=[MinValueValidator(0), MaxValueValidator(100)]
    )
    current_light = models.CharField(
         max_length=2,
         choices=LightType.choices,
         default=LightType.MEDIUM_LIGHT,
    )
    last_fertilized = models.DateTimeField(default=timezone.now)
