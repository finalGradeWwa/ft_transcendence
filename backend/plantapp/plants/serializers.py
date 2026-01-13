from rest_framework import serializers
from .models import Plant

class PlantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ["id", "name"]

class PlantSerializer(serializers.ModelSerializer):
	class Meta:
		model = Plant
		fields = (
			"plant_id",
			"nickname",
			"species",
			"created_at",
			"owner",
		)

class PlantDetailSerializer(serializers.ModelSerializer):
	class Meta:
		model = Plant
		fields = (
			"plant_id",
			"owner",
			"nickname",
			"species",
			"created_at",
			"garden",
		)
