from rest_framework.routers import DefaultRouter
from .views import GardenViewSet

router = DefaultRouter()
router.register(r"gardens", GardenViewSet, basename="garden")

urlpatterns = router.urls
