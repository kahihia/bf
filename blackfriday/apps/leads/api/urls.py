from rest_framework import routers
from .views import SubscribersViewSet, AdvertiserRequestsViewSet

router = routers.SimpleRouter()
router.register(r'subscribers', SubscribersViewSet)
router.register(r'applications', AdvertiserRequestsViewSet, base_name='applications')

urlpatterns = router.urls
