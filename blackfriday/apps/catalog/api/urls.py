from rest_framework import routers
from django.conf.urls import url

from .views import CategoryViewSet, product_feed_parse, product_feed_verify


router = routers.SimpleRouter()
router.register(r'categories', CategoryViewSet)


urlpatterns = router.urls

urlpatterns += [
    url('products/parse', product_feed_parse),
    url('products/verify', product_feed_verify),
]
