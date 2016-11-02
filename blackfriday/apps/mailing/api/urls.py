from rest_framework import routers

from .views import MailingViewSet, MailingBannersViewSet


router = routers.SimpleRouter()
router.register(r'mailing', MailingViewSet, base_name='mailing')
router.register(r'mailing/banners', MailingBannersViewSet, base_name='mailing_banners')

urlpatterns = router.urls
