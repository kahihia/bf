from rest_framework import routers

from .views import UserViewSet, RegistrationViewSet, SupportRequewestViewSet


router = routers.SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'registration', RegistrationViewSet)
router.register(r'support', SupportRequewestViewSet, base_name='support')

urlpatterns = router.urls
