from rest_framework import routers

from .views import OptionViewSet, PromoViewSet


router = routers.SimpleRouter()
router.register(r'options', OptionViewSet)
router.register(r'promos', PromoViewSet)


urlpatterns = router.urls
