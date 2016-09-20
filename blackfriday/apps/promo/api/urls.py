from rest_framework import routers

from .views import OptionViewSet, PromoViewSet, CustomPromoRequestsViewSet


router = routers.SimpleRouter()
router.register(r'options', OptionViewSet)
router.register(r'promos', PromoViewSet)
router.register(r'custom-promo-request', CustomPromoRequestsViewSet, base_name='custom-promo-request')

urlpatterns = router.urls
