from rest_framework import routers

from .views import MailingViewSet


router = routers.SimpleRouter()
router.register(r'mailing', MailingViewSet, base_name='mailing')

urlpatterns = router.urls
