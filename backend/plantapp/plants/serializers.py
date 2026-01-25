from rest_framework import serializers
from .models import Plant
from gardens.models import Garden

class PlantListSerializer(serializers.ModelSerializer):
    class Meta:
        model = Plant
        fields = ["id", "nickname", "image"]

class PlantSerializer(serializers.ModelSerializer):
	class Meta:
		model = Plant
		fields = (
			"plant_id",
			"nickname",
			"species",
			"created_at",
			"owner",
            "image",
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
			"image",
		)
            
# This serializer controls which fields users can modify when creating a new Plant
class PlantCreateSerializer(serializers.ModelSerializer):
    garden = serializers.PrimaryKeyRelatedField(
        queryset=Garden.objects.none()
    )
    class Meta:
        model = Plant
        fields = ("nickname", "species", "garden")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            user = request.user
            self.fields["garden"].queryset = Garden.objects.filter(
                gardenuser__user=user
            )
