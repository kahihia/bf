from rest_framework import routers

from .views import UserViewSet, RegistrationViewSet, SupportRequestViewSet


router = routers.SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'registration', RegistrationViewSet)
router.register(r'support', SupportRequestViewSet, base_name='support')

urlpatterns = router.urls
