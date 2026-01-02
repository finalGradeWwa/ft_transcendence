from django.db import models
from django.conf import settings

class PlantRequirement(models.Model):

    SOIL_TYPE_CHOICES = [
        ("sandy", "Sandy"), # Piaszczysta
        ("loamy", "Loamy"), # Gliniasta
        ("clayey", "Clayey"), # Ilasta
        ("silty", "Silty"), # mulowata
        ("peaty", "Peaty"), # Torfowa
        ("chalky", "Chalky"), # Wapienna
        ("saline", "Saline"), # Słona
    ]

    user = models.ForeignKey(settings.AUTH_USER_MODEL, on_delete=models.CASCADE)

    common_name = models.CharField(max_length=100)
    latin_name = models.CharField(max_length=150, blank=True, null=True)

    soil_moisture_min = models.FloatField(blank=True, null=True)
    soil_moisture_max = models.FloatField(blank=True, null=True)

    soil_ph_min = models.FloatField(blank=True, null=True)
    soil_ph_max = models.FloatField(blank=True, null=True)
    soil_type = models.CharField(max_length=50, choices=SOIL_TYPE_CHOICES, blank=True, null=True)

    light_min = models.FloatField(blank=True, null=True)
    light_max = models.FloatField(blank=True, null=True)

    temperature_min = models.FloatField(blank=True, null=True)
    temperature_max = models.FloatField(blank=True, null=True)

    air_humidity_min = models.FloatField(blank=True, null=True)
    air_humidity_max = models.FloatField(blank=True, null=True)

    nitrogen_min = models.FloatField(blank=True, null=True)
    nitrogen_max = models.FloatField(blank=True, null=True)

    phosphorus_min = models.FloatField(blank=True, null=True)
    phosphorus_max = models.FloatField(blank=True, null=True)

    potassium_min = models.FloatField(blank=True, null=True)
    potassium_max = models.FloatField(blank=True, null=True)
    def __str__(self):
        if self.latin_name:
            return f"{self.common_name} ({self.latin_name})"
        else:
            return f"{self.common_name}"