from rest_framework import serializers
from .models import Post
from gardens.models import Garden
from plants.models import Plant

class PostWriteModeSerializer(serializers.ModelSerializer):
	garden = serializers.PrimaryKeyRelatedField(queryset=Garden.objects.none())
	plant = serializers.PrimaryKeyRelatedField(queryset=Plant.objects.none())
	class Meta:
		model = Post
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
			


class PostDetailReadModeSerializer(serializers.ModelSerializer):
    garden = serializers.StringRelatedField(read_only=True)
    plant = serializers.StringRelatedField(read_only=True, required=False, allow_null=True)
    creator = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Post
        fields = (
            "content",
            "image",
            "creator",
            "garden",
            "plant",
            "created_at",
        )
        
class PostListReadModeSerializer(serializers.ModelSerializer):
    creator = serializers.StringRelatedField(read_only=True)
    class Meta:
        model = Post
        fields = (
            "content",
            "image",
            "creator",
            "created_at",
        )