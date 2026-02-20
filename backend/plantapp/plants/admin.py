from django.contrib import admin
from .models import Plant

"""
PL: Rejestracja modelu Plant w panelu administracyjnym Django.
EN: Registration of the Plant model in the Django admin panel.
"""
@admin.register(Plant)
class PlantAdmin(admin.ModelAdmin):
    list_display = ('plant_id', 'nickname', 'species', 'owner', 'garden', 'created_at')
    list_filter = ('garden', 'owner')
    search_fields = ('nickname', 'species', 'owner__username')
