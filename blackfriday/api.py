from django.conf.urls import include, url

urlpatterns = [
    url('^', include('apps.users.api.urls', namespace='users')),
    url('^', include('apps.advertisers.api.urls', namespace='advertisers')),
    url('^', include('apps.catalog.api.urls', namespace='catalog')),
    url('^', include('apps.banners.api.urls', namespace='banners')),
    url('^', include('apps.promo.api.urls', namespace='promo')),
    url('^', include('apps.leads.api.urls', namespace='leads'))
]
