from rest_framework import routers

from .views import SpecialViewSet


router = routers.SimpleRouter()
router.register(r'specials', SpecialViewSet)

urlpatterns = router.urls
