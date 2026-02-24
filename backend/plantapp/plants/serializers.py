from rest_framework import serializers
from .models import Plant
from gardens.models import Garden

class PlantListSerializer(serializers.ModelSerializer):
    owner_username = serializers.CharField(source='owner.username', read_only=True)
    garden_name = serializers.CharField(source='garden.name', read_only=True)
    image_url = serializers.SerializerMethodField()

    def get_image_url(self, obj):
        request = self.context.get('request')
        if obj.image:
            if request:
                return request.build_absolute_uri(obj.image.url)
            return f"http://localhost:8000{obj.image.url}"
        return None

    garden_id = serializers.IntegerField(source='garden.garden_id', read_only=True)

    class Meta:
        model = Plant
        fields = ["plant_id", "nickname", "species", "image", "image_url", "owner_username", "garden_name", "garden_id"]
        read_only_fields = fields

class PlantSerializer(serializers.ModelSerializer):
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
        fields = ("nickname", "species", "garden", "image")
    
    def __init__(self, *args, **kwargs):
        super().__init__(*args, **kwargs)
        request = self.context.get("request")
        if request:
            user = request.user
            self.fields["garden"].queryset = Garden.objects.filter(
                gardenuser__user=user
            )
