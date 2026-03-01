from rest_framework import serializers
from plants.serializers import PlantListSerializer
from .models import Garden, GardenUser


class GardenCreateSerializer(serializers.ModelSerializer):
    class Meta:
        model = Garden
        fields = ("name", "environment")

class GardenMemberSerializer(serializers.ModelSerializer):
    """
    Serializer for garden members to ensure consistent user data representation.
    """
    id = serializers.IntegerField(source='user.id', read_only=True)
    username = serializers.CharField(source='user.username', read_only=True)
    avatar_photo = serializers.ImageField(source='user.avatar_photo', read_only=True)

    class Meta:
        model = GardenUser
        fields = ('id', 'username', 'avatar_photo')

class GardenBaseSerializer(serializers.ModelSerializer):
    """
    Base serializer containing common fields for Garden listings and details.
    """
    user_count = serializers.IntegerField(read_only=True)
    plant_count = serializers.IntegerField(read_only=True)
    owner = serializers.SerializerMethodField()

    def get_owner(self, obj):
        # Relies on prefetch_related("owners__organization_user__user") in ViewSet
        owner_relation = obj.owners.first()
        if owner_relation and owner_relation.organization_user:
            return owner_relation.organization_user.user.username
        return None

    class Meta:
        model = Garden
        fields = (
            "garden_id",
            "name",
            "environment",
            "user_count",
            "plant_count",
            "owner",
        )
        read_only_fields = fields

class GardenListSerializer(GardenBaseSerializer):
    thumbnail = serializers.SerializerMethodField()

    def get_thumbnail(self, obj):
        request = self.context.get("request")
        # Get the first plant with an image to serve as thumbnail
        plant = (
            obj.plants.filter(image__isnull=False)
            .exclude(image="")
            .order_by("created_at")
            .first()
        )

        if plant and plant.image:
            if request:
                return request.build_absolute_uri(plant.image.url)
            return plant.image.url
        return None

    class Meta(GardenBaseSerializer.Meta):
        fields = GardenBaseSerializer.Meta.fields + ("thumbnail",)


"""
Returns garden details including list of plants and members.
"""
class GardenContentSerializer(GardenBaseSerializer):
    plants = PlantListSerializer(many=True, read_only=True)
    members = serializers.SerializerMethodField()

    def get_members(self, obj):
        # Optimization: select_related is used to fetch user data in one go
        queryset = obj.gardenuser_set.select_related('user').all()
        return GardenMemberSerializer(queryset, many=True, context=self.context).data

    class Meta(GardenBaseSerializer.Meta):
        fields = GardenBaseSerializer.Meta.fields + ("plants", "members")
