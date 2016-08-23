from rest_framework import routers

from .views import AdvertiserViewSet


router = routers.SimpleRouter()
router.register(r'advertisers', AdvertiserViewSet)

urlpatterns = router.urls
