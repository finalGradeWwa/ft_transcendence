from rest_framework.routers import DefaultRouter
from .views import PinViewSet

router = DefaultRouter()
router.register(r"pins", PinViewSet, basename="pins")

urlpatterns = router.urls
