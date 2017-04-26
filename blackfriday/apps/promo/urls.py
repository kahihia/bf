from django.conf.urls import url

from .views import PromoMakerView


urlpatterns = [
    url(r'^promo-maker/$', PromoMakerView.as_view(), name='promo-maker'),
]
