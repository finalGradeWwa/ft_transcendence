from django.db import models
from django.contrib.auth import get_user_model
from plants.models import Plant


User = get_user_model()

class Post(models.Model):
	content = models.TextField(max_length=150)
	image = models.ImageField(upload_to='media/')
	created_at = models.DateTimeField(auto_now_add=True)
	creator = models.ForeignKey(User, on_delete=models.CASCADE, related_name='posts')
	plant = models.ForeignKey(Plant, on_delete=models.CASCADE, related_name='posts')
	def __str__(self):
		return f"{self.user.username} - {self.content[:20]}..."
	
class Comment(models.Model):
	content = models.TextField(max_length=40)
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='comments')
	post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='comments')
	created_at = models.DateTimeField(auto_now_add=True)
	
	def __str__(self):
		return f"{self.user.username} - {self.content[:20]}..."

class Like(models.Model):
	user = models.ForeignKey(User, on_delete=models.CASCADE, related_name='likes')
	post = models.ForeignKey(Post, on_delete=models.CASCADE, related_name='likes')
    
	def __str__(self):
		return f"{self.user.username} liked {self.post.content[:20]}..."