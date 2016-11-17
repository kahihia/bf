from apps.advertisers.models import Merchant
from apps.catalog.models import Category

from apps.showcase.controllers import *
from apps.showcase.utils import render_to_file


def render_actions():
    render_to_file('actions/index.html', actions())


def render_all_merchants():
    render_to_file('merchants/index.html', merchants())


def render_category(category_id):
    try:
        cat = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        print('Такой категории не существует')
    else:
        render_to_file('category/{}/index.html'.format(cat.slug), category(category_id))


def render_main():
    render_to_file('index.html', main_page())


def render_merchant(merchant_id):
    try:
        merch = Merchant.objects.moderated().get(id=merchant_id)
    except Merchant.DoesNotExist:
        print('Такого магазина не существует или он не прошел модерацию')
    else:
        render_to_file('merchant/{}/index.html'.format(merch.slug), merchant(merchant_id))


def render_partners():
    render_to_file('partners/index.html', partners())


def render_russian_category(category_id):
    try:
        cat = Category.objects.russians().get(id=category_id)
    except Category.DoesNotExist:
        print('Такой категории не существует или в ней нет российских товаров')
    else:
        render_to_file('russian-goods/{}/index.html'.format(cat.slug), category(category_id, True))


def render_russiangoods():
    render_to_file('russian-goods/index.html', russiangoods())


def render_all_pages():
    render_actions()
    render_all_merchants()
    render_main()
    render_partners()
    render_russiangoods()
    for cat in Category.objects.all():
        render_category(cat.id)
    for m in Merchant.objects.moderated().all():
        render_merchant(m.id)
    for cat in Category.objects.russians():
        render_russian_category(cat.id)
