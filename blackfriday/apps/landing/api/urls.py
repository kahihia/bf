from rest_framework import routers
from .views import LandingLogoViewSet


router = routers.SimpleRouter()
router.register(r'landing-logos', LandingLogoViewSet)

urlpatterns = router.urls
