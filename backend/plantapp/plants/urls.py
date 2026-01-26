from rest_framework.routers import DefaultRouter
from .views import PlantViewSet

router = DefaultRouter()
router.register(r"", PlantViewSet, basename="plant")

urlpatterns = router.urls
