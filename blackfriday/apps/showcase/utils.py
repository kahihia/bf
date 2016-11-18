import os
from django.apps import apps
from django.conf import settings

from rest_framework import serializers


def serializer_factory(cls_name, fields, **extra_fields):
    return type(
        '{}ContextSerializer'.format(cls_name.split('.')[1]),
        (serializers.ModelSerializer, ),
        dict(
            extra_fields,
            **{'Meta': type('Meta', (), {'model': apps.get_model(cls_name), 'fields': fields})}
        )
    )


def render_to_file(template_name, content):
    os.makedirs(os.path.join(settings.SHOWCASE_ROOT, *template_name.split('/')[:-1]), exist_ok=True)
    with open(os.path.join(settings.SHOWCASE_ROOT, template_name), 'w') as f:
        f.seek(0)
        f.write(content)
        f.truncate()
    if settings.POST_RENDERING_EXEC_PATH:
        os.system(settings.POST_RENDERING_EXEC_PATH)
