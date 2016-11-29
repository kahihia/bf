import os

from .common import DJANGO_ROOT, PROJECT_ROOT

MEDIA_ROOT = os.path.normpath(os.path.join(PROJECT_ROOT, '_media'))
MEDIA_URL = '/media/'

SCREENSHOT_ROOT = os.path.normpath(os.path.join(MEDIA_ROOT, '_screenshots'))
SCREENSHOT_URL = MEDIA_URL + 'screenshots/'

STATIC_ROOT = os.path.normpath(os.path.join(PROJECT_ROOT, '_static'))
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.normpath(os.path.join(DJANGO_ROOT, 'static/static')),
)

STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
)
