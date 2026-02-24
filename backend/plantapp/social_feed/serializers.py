from rest_framework import serializers
from .models import Pin
from gardens.models import Garden
from plants.models import Plant

class PinWriteModeSerializer(serializers.ModelSerializer):
	garden = serializers.PrimaryKeyRelatedField(
		queryset=Garden.objects.none(),
		required=False,
		allow_null=True
	)
	plant = serializers.PrimaryKeyRelatedField(
		queryset=Plant.objects.none(),
		required=False,
		allow_null=True
	)
	class Meta:
		model = Pin
		fields = ("image", "content", "garden", "plant")
    
	def __init__(self, *args, **kwargs):
		super().__init__(*args, **kwargs)
		request = self.context.get("request")
		if request:
			user = request.user
			self.fields["garden"].queryset = Garden.objects.filter(
				gardenuser__user=user
			)
			self.fields["plant"].queryset = Plant.objects.filter(
				garden__in=self.fields["garden"].queryset
			)
			

# detail on user's wall
class PinDetailReadModeSerializer(serializers.ModelSerializer):
    garden = serializers.StringRelatedField(read_only=True)
    plant = serializers.StringRelatedField(read_only=True, required=False, allow_null=True)
    creator = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Pin
        fields = (
            "content",
            "image",
            "creator",
            "garden",
            "plant",
            "created_at",
        )

# list on user's feed
class PinListReadModeSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)
    plant_name = serializers.CharField(source='plant.nickname', read_only=True, allow_null=True)
    plant_id = serializers.IntegerField(source='plant.plant_id', read_only=True, allow_null=True)
    plant_image = serializers.ImageField(source='plant.image', read_only=True, allow_null=True)
    plant_owner = serializers.CharField(source='plant.owner.username', read_only=True, allow_null=True)
    garden_id = serializers.IntegerField(source='garden.garden_id', read_only=True, allow_null=True)
    garden_name = serializers.CharField(source='garden.name', read_only=True, allow_null=True)
    garden_owner = serializers.CharField(source='garden.owners.first.organization_user.user.username', read_only=True, allow_null=True)
    garden_image = serializers.SerializerMethodField()

    def get_garden_image(self, obj):
        if not obj.garden:
            return None
        first_plant = obj.garden.plants.filter(image__isnull=False).exclude(image='').order_by('plant_id').first()
        if first_plant and first_plant.image:
            return first_plant.image.url
        return None

    class Meta:
        model = Pin
        fields = (
            "id",
            "content",
            "image",
            "creator",
            "created_at",
            "plant_name",
            "plant_id",
            "plant_image",
            "plant_owner",
            "garden_id",
            "garden_name",
            "garden_owner",
            "garden_image",
        )