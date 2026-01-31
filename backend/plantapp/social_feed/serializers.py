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
    class Meta:
        model = Pin
        fields = (
            "content",
            "image",
            "creator",
            "created_at",
        )