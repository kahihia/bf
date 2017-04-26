from rest_framework import routers

from .views import PaymentViewSet


router = routers.SimpleRouter()
router.register(r'payments', PaymentViewSet)

urlpatterns = router.urls
