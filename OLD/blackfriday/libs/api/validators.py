from bs4 import BeautifulSoup

from django.conf import settings
from rest_framework.exceptions import ValidationError


def make_html_bypass_function(action):
    def func(html):
        not_allowed_tags = set()

        def bypass(node):
            if node.name:
                if node.name != '[document]':
                    action(node, not_allowed_tags)
                for subnode in node.children:
                    bypass(subnode)

        soup = BeautifulSoup(html, 'html.parser')
        bypass(soup)
        if not_allowed_tags:
            raise ValidationError('недопустимые теги: {}'.format(', '.join(not_allowed_tags)))

        return str(soup)
    return func


def _validate_html(node, errors):
    if node.name not in settings.HTML_VALIDATOR_ALLOWED_TAGS.keys():
        errors.add(node.name)


def _clean_html(node, errors):
    allowed = settings.HTML_VALIDATOR_ALLOWED_TAGS.get(node.name)
    if allowed is None:
        errors.add(node.name)
    elif not errors:
        node.attrs = {k: v for k, v in node.attrs.items() if k in allowed} if allowed else {}


html_validator = make_html_bypass_function(_validate_html)
clean_html = make_html_bypass_function(_clean_html)
