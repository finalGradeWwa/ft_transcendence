from rest_framework import serializers
from plants.serializers import PlantListSerializer
from .models import Garden

class GardenCreateSerializer(serializers.Serializer):
    name = serializers.CharField(required=True, max_length=255)
    environment = serializers.CharField(required=False, default="I", max_length=1)

class GardenListSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField(read_only=True)
    class Meta:
        model = Garden
        fields = (
            "garden_id",
            "name",
            "environment",
            "user_count"
        )
        read_only_fields = fields

class GardenContentSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    user_count = serializers.IntegerField(read_only=True)
    plants = PlantListSerializer(many=True)
    def get_owner(self, garden):
        owner = garden.owners.first()
        return owner.organization_user.user.username if owner else None
    
    class Meta:
        model = Garden
        fields = [
            "garden_id",
            "name",
            "environment",
            "plants",
            "owner",
            "user_count",
        ]
