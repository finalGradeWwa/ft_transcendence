from django.db import models
from django.contrib.auth import get_user_model
from plants.models import Plant
from gardens.models import Garden

User = get_user_model()

class Post(models.Model):
	content = models.TextField(max_length=150)
	image = models.ImageField(upload_to='media/')
	created_at = models.DateTimeField(auto_now_add=True)
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
	plant = models.ForeignKey(
		Plant,
		on_delete=models.CASCADE,
		related_name='posts',
		null=True,
		blank=True,
		)
	garden = models.ForeignKey(Garden, on_delete=models.CASCADE, related_name='posts')
	
	def __str__(self):
		return f"{self.creator.username} - {self.content[:20]}..."
