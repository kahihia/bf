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


def render_to_file(template_name, content, exec_script=False):
    os.makedirs(os.path.join(settings.SHOWCASE_ROOT, *template_name.split('/')[:-1]), exist_ok=True)
    with open(os.path.join(settings.SHOWCASE_ROOT, template_name), 'w') as f:
        f.seek(0)
        f.write(content)
        f.truncate()
    if (
        exec_script and
        settings.POST_RENDERING_EXEC_PATH and
        os.path.exists(settings.POST_RENDERING_EXEC_PATH) and
        os.path.isfile(settings.POST_RENDERING_EXEC_PATH) and
        os.access(settings.POST_RENDERING_EXEC_PATH, os.X_OK)
    ):
        os.system(settings.POST_RENDERING_EXEC_PATH)
