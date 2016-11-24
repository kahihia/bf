import io
from functools import reduce
from itertools import groupby

import weasyprint

from collections import defaultdict

from django.db.models import Count
from django.template.loader import render_to_string
from django.http.response import StreamingHttpResponse

from rest_framework import viewsets
from rest_framework.decorators import list_route

from apps.catalog.models import Product
from apps.promo.models import Option
from libs.api.permissions import IsAdmin, IsOwner, IsAuthenticated, IsAdvertiser
from apps.advertisers.models import Banner, Merchant, BannerType
from apps.reports.models import BannerStats, LogoStats, TeaserStats


class ReportsViewSet(viewsets.GenericViewSet):
    permission_classes = [IsAuthenticated, IsAdmin | IsAdvertiser & IsOwner]

    @staticmethod
    def create_report(report_name, params={}):
        output = io.BytesIO()
        weasyprint.HTML(
            string=render_to_string(
                '{}.html'.format(report_name),
                params
            )
        ).write_pdf(output)
        output.seek(0)
        response = StreamingHttpResponse(output, content_type='application/pdf')
        response['Content-Disposition'] = (
            'attachment; filename="Статистика размещение рекламных материалов.pdf"'
        )
        return response

    @list_route(methods=['get'])
    def statistics(self, request, *args, **kwargs):
        user = self.request.user

        banner_stats_dict = defaultdict(list)
        banner_stats_qs = BannerStats.objects.filter(
            banner__merchant__advertiser=user).select_related('banner')
        for stats_obj in banner_stats_qs:
            banner_stats_dict[stats_obj.banner.type] = stats_obj

        logo_stats_qs = LogoStats.objects.filter(merchant__advertiser=user)
        teaser_stats_qs = TeaserStats.objects.filter(product__merchant__advertiser=user)

        elements = []

        if logo_stats_qs:
            logo_stats = logo_stats_qs[0]
            elements.append(
                {
                    'name': 'Логотип',
                    'shown': logo_stats.times_shown,
                    'clicked': logo_stats.times_clicked
                }
            )

        if banner_stats_qs:
            for banner_type, banner_type_name in Banner.TYPES:
                b_type_stats = banner_stats_dict[banner_type]
                if b_type_stats:
                    if len(b_type_stats) > 1:
                        for number, banner_stats in enumerate(b_type_stats, 1):
                            elements.append(
                                {
                                    'name': '{} №{}'.format(banner_type_name, number),
                                    'shown': banner_stats.times_shown,
                                    'clicked': banner_stats.times_clicked
                                }
                            )
                    else:
                        banner_stats = b_type_stats[0]
                        elements.append(
                            {
                                'name': banner_type_name,
                                'shown': banner_stats.times_shown,
                                'clicked': banner_stats.times_clicked
                            }
                        )

        if teaser_stats_qs:
            if len(teaser_stats_qs) > 1:
                for number, teaser_stats in enumerate(teaser_stats_qs, 1):
                    elements.append(
                        {
                            'name': 'Товар-тизер №{}'.format(number),
                            'shown': teaser_stats.times_shown,
                            'clicked': teaser_stats.times_clicked
                        }
                    )
            else:
                teaser_stats = teaser_stats_qs[0]
                elements.append(
                    {
                        'name': 'Товар-тизер',
                        'shown': teaser_stats.times_shown,
                        'clicked': teaser_stats.times_clicked
                    }
                )

        elements.append(
            {
                'name': 'ИТОГО',
                'shown': sum([el['shown'] for el in elements]),
                'clicked': sum([el['clicked'] for el in elements])
            }
        )

        return self.create_report('statistics', {'elements': elements})

    @list_route(methods=['get'])
    def act_report(self, request, *args, **kwargs):
        user = self.request.user

        banners = Banner.objects.filter(merchant__advertiser=user).annotate(cat_count=Count('categories'))
        merchants = Merchant.objects.filter(advertiser=user).annotate(cat_count=Count('logo_categories'))
        products = Product.objects.filter(merchant__advertiser=user)
        options = Option.objects.filter(promos__promo__in=[m.promo for m in merchants], promos__value__gt=0)

        # limits = reduce(
        #     lambda x, y: {k: x.get(k, 0) + y.get(k, 0) for k in set(x) | set(y)},
        #     map(lambda x: x.limits, merchants),
        #     {}
        # )

        params = {
            'super_banner':
                len(list(filter(lambda x: x.type == BannerType.SUPER, banners))),
            'logo':
                len(list(filter(lambda x: x.image, merchants))),
            'description':
                len(list(filter(lambda x: x.description, merchants))),
            'action_banner':
                len(list(filter(lambda x: x.type == BannerType.ACTION, banners))),
            'showcase':
                len(set(map(lambda x: x.merchant_id, products))),
            'logo_at_main':
                len(list(filter(lambda x: x.tech_name == 'logo_on_main', options))),
            'logo_at_cat':
                len(list(filter(lambda x: x.image and x.cat_count >= 2, merchants))),
            'action_banner_at_cat':  # TODO
                [len(list(g)) for _, g in groupby(sorted(filter(lambda x: x.cat_count >= 2 and x.type == BannerType.ACTION, banners), key=lambda x: x.merchant_id), key=lambda x: x.merchant_id)],
                # (banners.annotate(cats=Count('categories')).filter(cats__gte=2, type=BannerType.ACTION)
                #  .values('merchant').annotate(count=Count('id')).filter(count__gte=4).count())
            'super_banner_at_cat':
                (banners.annotate(cats=Count('categories')).filter(cats__gte=1, type=BannerType.SUPER)
                 .values('merchant').distinct().count()),
            'action_banner_at_main':
                ()
        }



        return self.create_report('act_report')
