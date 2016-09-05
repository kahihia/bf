from rest_framework import routers
from django.conf.urls import url
from libs.api.routers import ExtendedNestedRouter

from apps.advertisers.api.urls import router as adv_router

from .views import CategoryViewSet, ProductViewSet


router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)
merchant_router = ExtendedNestedRouter(adv_router, r'merchants', lookup='merchant')
merchant_router.register(r'products', ProductViewSet)


urlpatterns = router.urls
urlpatterns += merchant_router.urls
