from django.db import models
from django.contrib.auth import get_user_model
from plants.models import Plant
from gardens.models import Garden

User = get_user_model()

class Pin(models.Model):
	content = models.TextField(max_length=150)
	image = models.ImageField(upload_to='media/', null=True, blank=True)
	created_at = models.DateTimeField(auto_now_add=True)
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='pins')
	plant = models.ForeignKey(
		Plant,
		on_delete=models.CASCADE,
		related_name='pins',
		null=True,
		blank=True,
		)
	garden = models.ForeignKey(
		Garden,
		on_delete=models.CASCADE,
		related_name='pins',
		null=True,
		blank=True,
		)
	
	def __str__(self):
		return f"{self.creator.username} - {self.content[:20]}..."
