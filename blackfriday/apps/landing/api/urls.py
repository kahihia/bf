from rest_framework import routers
from .views import LandingLogoViewSet, StaticGeneratorViewSet


router = routers.SimpleRouter()
router.register(r'landing-logos', LandingLogoViewSet)
router.register(r'static-generator', StaticGeneratorViewSet, base_name='static-generator')

urlpatterns = router.urls
