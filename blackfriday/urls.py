from django.conf import settings
from django.conf.urls import url, include
from django.contrib import admin
from django.views.generic.base import TemplateView
from django.contrib.auth import views as auth_views


urlpatterns = [
    url(r'^users/', include('apps.users.urls', namespace='users')),
    url(r'^advertisers/', include('apps.advertisers.urls', namespace='advertisers')),

    url(r'^api/', include('api', namespace='api')),

    url(r'^django-admin/', include(admin.site.urls)),

    url(r'^admin\/registration/$', TemplateView.as_view(template_name='users/registration.html')),
    url(r'^admin\/login/$', auth_views.login, {'template_name': 'users/login.html'}),

    url(r'^landing/$', TemplateView.as_view(template_name='landing.html')),
]


if settings.DEBUG:
    from django.conf.urls.static import static

    urlpatterns += static(settings.MEDIA_URL, document_root=settings.MEDIA_ROOT)
    urlpatterns += [url(r'^api-auth/', include('rest_framework.urls', namespace='rest_framework'))]
