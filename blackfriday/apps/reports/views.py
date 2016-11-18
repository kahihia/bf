import io
import weasyprint

from collections import defaultdict

from django.template.loader import render_to_string

from apps.advertisers.models import Banner
from apps.reports.models import BannerStats, LogoStats, TeaserStats


def create_report(report_name, **params):
    output = io.BytesIO()
    weasyprint.HTML(
        string=render_to_string(
            '{}.html'.format(report_name),
            **params
        )
    ).write_pdf(output)
    output.seek(0)
    with open('{}.pdf'.format(report_name), 'wb') as f:
        f.write(output.read())


def get_act_report(user):
    create_report('act_report')


def get_statistics(user):
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
                'clicks': logo_stats.times_clicked
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

    create_report('statistics', elements=elements)
