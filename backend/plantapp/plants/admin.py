from django.contrib import admin
from .models import PlantRequirement

@admin.register(PlantRequirement)
class PlantRequirementAdmin(admin.ModelAdmin):
    list_display = ('common_name', 'latin_name', 'user', 'soil_type')
    list_filter = ('soil_type', 'user')
    search_fields = ('common_name', 'latin_name')