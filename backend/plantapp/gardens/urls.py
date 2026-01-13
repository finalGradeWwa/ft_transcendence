from django.urls import path
from .views import GardenAPIView, ListMyGardens, AddGardenUserAPIView, RemoveGardenUserAPIView

urlpatterns = [
	path('', GardenAPIView.as_view(), name='garden-create'),
	path('my/', ListMyGardens.as_view(), name='my-gardens'),
	path('<int:pk>/', GardenAPIView.as_view(), name='garden-detail'),
	path(
		"<int:pk>/users/",
		AddGardenUserAPIView.as_view(),
		name="garden-user-create",
	),
	path('user/<int:pk>/', RemoveGardenUserAPIView.as_view(), name='garden-user-detail'), 
]
