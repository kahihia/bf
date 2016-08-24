from rest_framework import routers

from .views import PartnerViewSet


router = routers.SimpleRouter()
router.register(r'partners', PartnerViewSet)

urlpatterns = router.urls
