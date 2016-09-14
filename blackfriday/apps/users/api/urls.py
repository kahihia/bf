from rest_framework import routers

from .views import UserViewSet, RegistrationViewSet


router = routers.SimpleRouter()
router.register(r'users', UserViewSet)
router.register(r'registration', RegistrationViewSet)

urlpatterns = router.urls
