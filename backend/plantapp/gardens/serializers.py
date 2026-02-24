from rest_framework import serializers
from plants.serializers import PlantListSerializer
from .models import Garden


class GardenCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Garden
        fields = ("name", "environment")


class GardenListSerializer(serializers.ModelSerializer):
    user_count = serializers.IntegerField(read_only=True)
    plant_count = serializers.IntegerField(read_only=True)
    thumbnail = serializers.SerializerMethodField()
    owner = serializers.SerializerMethodField()

    def get_owner(self, obj):
        owner = obj.owners.first()
        try:
            return owner.organization_user.user.username if owner else None
        except AttributeError:
            return None

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        plant = (
            obj.plants.filter(image__isnull=False)
            .exclude(image="")
            .order_by("created_at")
            .first()
        )
        if plant and plant.image:
            if request:
                return request.build_absolute_uri(plant.image.url)
            return f"http://localhost:8000{plant.image.url}"
        return None

    class Meta:
        model = Garden
        fields = (
            "garden_id",
            "name",
            "environment",
            "user_count",
            "plant_count",
            "thumbnail",
            "owner",
        )
        read_only_fields = fields


class GardenContentSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    user_count = serializers.IntegerField(read_only=True)
    plant_count = serializers.IntegerField(read_only=True)
    plants = PlantListSerializer(many=True)

    def get_owner(self, garden):
        owner = garden.owners.first()
        # Dodano zabezpieczenie, by nie wywaliło błędu jeśli owner lub user nie istnieją
        try:
            return owner.organization_user.user.username if owner else None
        except AttributeError:
            return None

    class Meta:
        model = Garden
        fields = [
            "garden_id",
            "name",
            "environment",
            "plants",
            "owner",
            "user_count",
            "plant_count",
        ]

"""
PL: Zwraca listę członków ogrodu z ich id, nazwą użytkownika i avatarem.
EN: Returns a list of garden members with their id, username and avatar.
"""
class GardenContentSerializer(serializers.ModelSerializer):
    owner = serializers.SerializerMethodField()
    user_count = serializers.IntegerField(read_only=True)
    plant_count = serializers.IntegerField(read_only=True)
    plants = PlantListSerializer(many=True)
    members = serializers.SerializerMethodField()

    def get_owner(self, garden):
        owner = garden.owners.first()
        try:
            return owner.organization_user.user.username if owner else None
        except AttributeError:
            return None

    def get_members(self, garden):
        garden_users = garden.gardenuser_set.select_related('user').all()
        return [
            {
                'id': gu.user.id,
                'username': gu.user.username,
                'avatar_photo': gu.user.avatar_photo.url if gu.user.avatar_photo else None,
            }
            for gu in garden_users
        ]

    class Meta:
        model = Garden
        fields = [
            "garden_id",
            "name",
            "environment",
            "plants",
            "owner",
            "members",
            "user_count",
            "plant_count",
        ]
