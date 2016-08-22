from django.conf.urls import url, include
from django.contrib import admin

urlpatterns = [
    url(r'^users/', include('apps.users.urls', namespace='users')),

    url(r'^api/', include('api', namespace='api')),

    url(r'^django-admin/', include(admin.site.urls)),
]
