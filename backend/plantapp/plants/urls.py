from django.urls import path
from .views import PlantAPIView, ListMyPlants

urlpatterns = [
    path("", PlantAPIView.as_view(), name="create-plant"),
    path("<int:pk>/", PlantAPIView.as_view(), name="get-plant"),
	path("my-plants", ListMyPlants.as_view(), name="get-my-plants"),
]
