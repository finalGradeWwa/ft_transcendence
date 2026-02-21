from django.contrib import admin
from .models import Garden, GardenUser, GardenOwner

"""
PL: Rejestracja modeli Garden w panelu administracyjnym Django.
EN: Registration of Garden models in the Django admin panel.
"""

@admin.register(Garden)
class GardenAdmin(admin.ModelAdmin):
	"""
	PL: Konfiguracja widoku Garden w panelu admin.
	EN: Configuration of Garden view in admin panel.
	"""
	list_display = ('garden_id', 'name', 'environment', 'get_owner', 'get_plant_count')
	list_filter = ('environment',)
	search_fields = ('name', 'owners__organization_user__user__username')
	
	def get_owner(self, obj):
		owner = obj.owners.first()
		return owner.organization_user.user.username if owner else None
	get_owner.short_description = 'Owner'
	
	def get_plant_count(self, obj):
		return obj.plants.count()
	get_plant_count.short_description = 'Plants'

@admin.register(GardenUser)
class GardenUserAdmin(admin.ModelAdmin):
	list_display = ('id', 'organization', 'user')
	search_fields = ('user__username', 'organization__name')

@admin.register(GardenOwner)
class GardenOwnerAdmin(admin.ModelAdmin):
	list_display = ('id', 'organization', 'get_username')
	
	def get_username(self, obj):
		return obj.organization_user.user.username
	get_username.short_description = 'Owner Username'
