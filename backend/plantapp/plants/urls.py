from rest_framework.routers import DefaultRouter
from .views import PlantViewSet

router = DefaultRouter()
router.register(r"plant", PlantViewSet, basename="plant")

urlpatterns = router.urls
