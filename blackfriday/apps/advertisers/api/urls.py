from rest_framework_nested import routers

from .views import AdvertiserViewSet, MerchantViewSet, BannerViewSet


router = routers.SimpleRouter()
router.register(r'advertisers', AdvertiserViewSet)
router.register(r'merchants', MerchantViewSet, base_name='merchants')

merchants_router = routers.NestedSimpleRouter(router, r'merchants', lookup='merchant')
merchants_router.register(r'banners', BannerViewSet)

urlpatterns = router.urls + merchants_router.urls
