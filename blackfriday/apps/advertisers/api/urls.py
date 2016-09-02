from rest_framework import routers

from .views import AdvertiserViewSet, MerchantViewSet


router = routers.SimpleRouter()
router.register(r'advertisers', AdvertiserViewSet)
router.register(r'merchants', MerchantViewSet)

urlpatterns = router.urls
