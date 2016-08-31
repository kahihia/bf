from rest_framework import routers
from .views import SubscribersViewSet

router = routers.SimpleRouter()
router.register(r'subscribers', SubscribersViewSet)

urlpatterns = router.urls
