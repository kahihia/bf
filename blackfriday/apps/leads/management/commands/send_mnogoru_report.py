import codecs
import csv
import io
import pytz

from django.conf import settings
from django.core.mail.message import EmailMessage
from django.core.management import BaseCommand
from django.utils.datetime_safe import datetime

from apps.leads.models import Subscriber


class Command(BaseCommand):
    def handle(self, *args, **options):

        csv_file = io.StringIO()
        csv_file.write(codecs.BOM_UTF8.decode('utf-8'))
        csv_writer = csv.writer(csv_file)
        for subscriber in Subscriber.objects.filter(join_mnogo_ru=True):
            csv_writer.writerow([subscriber.email])

        if settings.MNOGO_LEADS_MANAGERS:
            message = EmailMessage(
                subject='Подписчики для mnogo.ru',
                body='Сгенерирован {}'.format(
                    datetime.now(pytz.timezone('Europe/Moscow')).strftime('%Y-%m-%d %H:%M:%S')),
                to=map(lambda x: '"{}" <{}>'.format(*x), settings.MNOGO_LEADS_MANAGERS)
            )
            message.attach(filename='subscribers.csv', content=csv_file.getvalue(), mimetype='text/csv')
            message.send()
