from django.conf.urls import url
from .views import (
    MainPreview, ActionsPreview, MerchantsPreview, CategoryPreview, RussianGoodsPreview, PartnersPreview
)


urlpatterns = [
    url(r'main/preview/$', MainPreview.as_view(), name='main_preview'),
    url(r'actions/preview/$', ActionsPreview.as_view(), name='actions_preview'),
    url(r'merchants/preview/$', MerchantsPreview.as_view(), name='merchants_preview'),
    url(r'categories/(?P<pk>\d+)/preview/$', CategoryPreview.as_view(), name='category_preview'),
    url(r'russiangoods/preview/$', RussianGoodsPreview.as_view(), name='russiangoods_preview'),
    url(r'partners/preview/$', PartnersPreview.as_view(), name='partners_preview'),
]
