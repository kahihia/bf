from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin


urlpatterns = [
    url(r'^users/', include('apps.users.urls', namespace='users')),

    url(r'^api/', include('api', namespace='api')),

    url(r'^django-admin/', include(admin.site.urls)),
]


if settings.DEBUG:
    urlpatterns += [url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))]
