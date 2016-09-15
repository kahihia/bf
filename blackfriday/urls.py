from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin

from .views import StaticGeneratorView, LandingGeneratorView


urlpatterns = [
    url(r'^admin/', include([
        url(r'^', include('apps.users.urls', namespace='users')),
        url(r'^', include('apps.advertisers.urls', namespace='advertisers')),
        url(r'^', include('apps.leads.urls', namespace='leads')),
        url(r'^', include('apps.catalog.urls', namespace='catalog')),
        url(r'^', include('apps.promo.urls', namespace='promo')),
        url(r'^', include('apps.orders.urls', namespace='orders')),
        url(r'^', include('apps.banners.urls', namespace='banners')),

        url(r'^landing/$', LandingGeneratorView.as_view(), name='landing'),
        url(r'^static-generator/$', StaticGeneratorView.as_view(), name='static-generator'),
    ])),
    url(r'^api/', include('api', namespace='api')),
    url(r'^django-admin/', include(admin.site.urls)),
]


if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))]
