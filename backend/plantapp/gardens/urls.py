from rest_framework.routers import DefaultRouter
from .views import GardenViewSet

router = DefaultRouter()
router.register(r"garden", GardenViewSet, basename="garden")

urlpatterns = router.urls
