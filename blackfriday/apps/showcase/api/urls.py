from rest_framework import routers
from django.conf.urls import url

from .views import (
    StaticGeneratorViewSet, StaticGeneratorCategoriesView,
    StaticGeneratorRussianCategoriesView, StaticGeneratorMerchantView
)


router = routers.SimpleRouter()
router.register(r'static-generator', StaticGeneratorViewSet, base_name='static-generator')
urlpatterns = [
    url(r'^static-generator/categories/(?P<pk>\d+)/$', StaticGeneratorCategoriesView.as_view()),
    url(r'^static-generator/merchants/(?P<pk>\d+)/$', StaticGeneratorMerchantView.as_view()),
    url(r'^static-generator/russian-categories/(?P<pk>\d+)/$', StaticGeneratorRussianCategoriesView.as_view()),
]

urlpatterns += router.urls
