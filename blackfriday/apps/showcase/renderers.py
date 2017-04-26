import os
import sys
import concurrent.futures

from django.db import connection
from django_rq import job

from apps.advertisers.models import Merchant
from apps.catalog.models import Category

from apps.showcase.controllers import *
from apps.showcase.utils import render_to_file


@job
def render_actions(exec_script=False):
    render_to_file('actions/index.html', actions(), exec_script)
    sys.stdout.write('все акции\n')


@job
def render_all_merchants(exec_script=False):
    render_to_file('merchants/index.html', merchants(), exec_script)
    sys.stdout.write('все участники\n')


@job
def render_category(category_id, exec_script=False):
    try:
        cat = Category.objects.get(id=category_id)
    except Category.DoesNotExist:
        sys.stderr.write('Такой категории не существует\n')
    else:
        render_to_file('category/{}/index.html'.format(cat.slug), category(category_id), exec_script)
        sys.stdout.write('категория {cat.name}\n'.format(cat=cat))


@job
def render_main(exec_script=False):
    render_to_file('index.html', main_page(), exec_script)
    sys.stdout.write('главная\n')


@job
def render_merchant(merchant_id, exec_script=False):
    try:
        merch = Merchant.objects.moderated().filter(is_active=True).get(id=merchant_id)
    except Merchant.DoesNotExist:
        sys.stderr.write('Такого магазина не существует или он не прошел модерацию\n')
    else:
        render_to_file('merchant/{}/index.html'.format(merch.slug), merchant(merchant_id), exec_script)
        sys.stdout.write('магазин {merch.name}\n'.format(merch=merch))


@job
def render_partners(exec_script=False):
    render_to_file('partners/index.html', partners(), exec_script)
    sys.stdout.write('партнёры\n')


@job
def render_russian_category(category_id, exec_script=False):
    try:
        cat = Category.objects.russians().get(id=category_id)
    except Category.DoesNotExist:
        sys.stderr.write('Такой категории не существует или в ней нет российских товаров\n')
    else:
        render_to_file('russian-goods/{}/index.html'.format(cat.slug), category(category_id, True), exec_script)
        sys.stdout.write('российские товары — категория {cat.name}\n'.format(cat=cat))


@job
def render_russiangoods(exec_script=False):
    render_to_file('russian-goods/index.html', russiangoods(), exec_script)
    sys.stdout.write('российские товары\n')


@job
def render_all_pages(exec_script=False):
    category_ids = list(Category.objects.values_list('id', flat=True))
    merchant_ids = list(Merchant.objects.moderated().filter(is_active=True).values_list('id', flat=True))
    russian_category_ids = list(Category.objects.russians().values_list('id', flat=True))
    connection.close()
    with concurrent.futures.ProcessPoolExecutor(max_workers=settings.RENDER_WORKER_COUNT) as executor:
        executor.submit(render_actions)
        executor.submit(render_all_merchants)
        executor.submit(render_main)
        executor.submit(render_partners)
        executor.submit(render_russiangoods)
        for cat_id in category_ids:
            executor.submit(render_category, cat_id)
        for m_id in merchant_ids:
            executor.submit(render_merchant, m_id)
        for cat_id in russian_category_ids:
            executor.submit(render_russian_category, cat_id)
    if (
        exec_script and
        settings.POST_RENDERING_EXEC_PATH and
        os.path.exists(settings.POST_RENDERING_EXEC_PATH) and
        os.path.isfile(settings.POST_RENDERING_EXEC_PATH) and
        os.access(settings.POST_RENDERING_EXEC_PATH, os.X_OK)
    ):
        os.system(settings.POST_RENDERING_EXEC_PATH)
