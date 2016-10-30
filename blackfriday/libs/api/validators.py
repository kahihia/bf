import lxml.html as html

from io import StringIO
from rest_framework.exceptions import ValidationError


ALLOWED_TAGS = {
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'blockquote', 'ul', 'li', 'b', 'i', 'u', 'ol', 'p', 'a', 'body', 'html',
    'div', 'span'
}


def html_validator(value):
    root = html.parse(StringIO(value)).getroot()
    not_allowed_tags = []
    for element in root.getiterator():
        if element.tag not in ALLOWED_TAGS:
            not_allowed_tags.append(element.tag)

    if not_allowed_tags:
        raise ValidationError('недопустимые теги: {}'.format(', '.join(not_allowed_tags)))
