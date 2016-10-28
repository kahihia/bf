from functools import partial

from django.conf import settings
from django.core.mail import send_mail
from django.template.loader import render_to_string


def send_html_mail(user, subject, template, context):
    send_mail(
        subject=subject,
        recipient_list=[user.email],
        from_email=settings.DEFAULT_FROM_EMAIL,
        html_message=render_to_string(
            'mailing/messages/{}_mail.html'.format(template),
            context
        ),
        message=''
    )


def send_advertiser_registration_mail(user):
    send_html_mail(user=user,
                   subject='Вы зарегистрированы на RealBlackFriday.ru',
                   template='advertiser_registration',
                   context={})


def send_merchant_creation_mail(merchant):
    send_html_mail(user=merchant.advertiser,
                   subject='Вы создали магазин {} на RealBlackFriday.ru'.format(merchant.name),
                   template='merchant_creation',
                   context={'merchant': merchant})


def send_invoice_creation_mail(invoice):
    send_html_mail(user=invoice.merchant.advertiser,
                   subject='Оплатите счёт для создания магазина на RealBlackFriday.ru',
                   template='invoice_creation',
                   context={})


def send_moderation_request_mail(merchant):
    send_html_mail(user=merchant.advertiser,
                   subject='Вы загрузили рекламные материалы в магазин {} на RealBlackFriday.ru'.format(merchant.name),
                   template='moderation_request',
                   context={'merchant': merchant})


def send_moderation_success_mail(merchant):
    send_html_mail(user=merchant.advertiser,
                   subject='Магазин {} прошёл модерацию на RealBlackFriday.ru'.format(merchant.name),
                   template='moderation_success',
                   context={'merchant': merchant})


def send_moderation_fail_mail(merchant):
    send_html_mail(user=merchant.advertiser,
                   subject='Магазин {} не прошел модерацию на realblackfriday.ru'.format(merchant.name),
                   template='moderation_fail',
                   context={'merchant': merchant})
