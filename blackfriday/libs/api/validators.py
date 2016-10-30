import lxml.html as html

from django.conf import settings
from io import StringIO
from rest_framework.exceptions import ValidationError


def html_validator(value):
    root = html.parse(StringIO(value)).getroot()
    not_allowed_tags = []
    for element in root.getiterator():
        if element.tag not in settings.HTML_VALIDATOR_ALLOWED_TAGS:
            not_allowed_tags.append(element.tag)

    if not_allowed_tags:
        raise ValidationError('недопустимые теги: {}'.format(', '.join(not_allowed_tags)))
