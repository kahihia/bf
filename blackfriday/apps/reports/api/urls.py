from rest_framework import routers

from apps.reports.api.views import ReportsViewSet


router = routers.SimpleRouter()
router.register(r'reports', ReportsViewSet, base_name='reports')

urlpatterns = router.urls
