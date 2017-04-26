from rest_framework import routers

from .views import InvoiceViewSet

router = routers.SimpleRouter()
router.register(r'invoices', InvoiceViewSet)

urlpatterns = router.urls
