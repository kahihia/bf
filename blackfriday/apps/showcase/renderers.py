import os

from django_rq import job

from apps.advertisers.models import Merchant
from apps.catalog.models import Category

from apps.showcase.controllers import *
from apps.showcase.utils import render_to_file


@job
def render_actions(exec_script=False):
    render_to_file('actions/index.html', actions(), exec_script)


@job
def render_all_merchants(exec_script=False):
    render_to_file('merchants/index.html', merchants(), exec_script)


@job
def render_category(category_id, exec_script=False):
    try:
        cat = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        print('Такой категории не существует')
    else:
        render_to_file('category/{}/index.html'.format(cat.slug), category(category_id), exec_script)


@job
def render_main(exec_script=False):
    render_to_file('index.html', main_page(), exec_script)


@job
def render_merchant(merchant_id, exec_script=False):
    try:
        merch = Merchant.objects.moderated().get(id=merchant_id)
    except Merchant.DoesNotExist:
        print('Такого магазина не существует или он не прошел модерацию')
    else:
        render_to_file('merchant/{}/index.html'.format(merch.slug), merchant(merchant_id), exec_script)


@job
def render_partners(exec_script=False):
    render_to_file('partners/index.html', partners(), exec_script)


@job
def render_russian_category(category_id, exec_script=False):
    try:
        cat = Category.objects.russians().get(id=category_id)
    except Category.DoesNotExist:
        print('Такой категории не существует или в ней нет российских товаров')
    else:
        render_to_file('russian-goods/{}/index.html'.format(cat.slug), category(category_id, True), exec_script)


@job
def render_russiangoods(exec_script=False):
    render_to_file('russian-goods/index.html', russiangoods(), exec_script)


@job
def render_all_pages(exec_script=False):
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

    if (
        exec_script and
        settings.POST_RENDERING_EXEC_PATH and
        os.path.exists(settings.POST_RENDERING_EXEC_PATH) and
        os.path.isfile(settings.POST_RENDERING_EXEC_PATH) and
        os.access(settings.POST_RENDERING_EXEC_PATH, os.X_OK)
    ):
        os.system(settings.POST_RENDERING_EXEC_PATH)
