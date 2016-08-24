from rest_framework import routers

from .views import CategoryViewSet


router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)


urlpatterns = router.urls
