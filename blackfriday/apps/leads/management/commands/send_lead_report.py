import codecs
import csv
import io

from django.conf import settings
from django.core.mail.message import EmailMessage
from django.core.management import BaseCommand
from django.utils.datetime_safe import datetime

from ...models import AdvertiserRequest


class Command(BaseCommand):
    def handle(self, *args, **options):
        fields = ['name', 'organization_name', 'email', 'phone']
        fieldnames = ['Имя', 'Организация', 'E-mail', 'Телефон']

        qs = AdvertiserRequest.objects.all().order_by('-datetime_updated').values_list(*fields)

        csv_file = io.StringIO()
        csv_file.write(codecs.BOM_UTF8.decode('utf-8'))

        csv_writer = csv.DictWriter(csv_file, fieldnames=fieldnames, delimiter=';')
        csv_writer.writeheader()
        for row in map(lambda r: dict(zip(fieldnames, r)), qs):
            csv_writer.writerow(row)

        message = EmailMessage(
            subject='Отчет по заявкам',
            body='Сгенерирован {}'.format(datetime.now().strftime('%Y-%m-%d %H:%M:%S')),
            to=map(lambda x: '"{}" <{}>'.format(*x), settings.MANAGERS)
        )
        message.attach(filename='leads.csv', content=csv_file.getvalue(), mimetype='text/csv')
        message.send()
