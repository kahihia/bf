import os

from .common import DJANGO_ROOT, PROJECT_ROOT


MEDIA_ROOT = os.path.normpath(os.path.join(PROJECT_ROOT, '_media'))
MEDIA_URL = '/media/'


STATIC_ROOT = os.path.normpath(os.path.join(PROJECT_ROOT, '_static'))
STATIC_URL = '/static/'
STATICFILES_DIRS = (
    os.path.normpath(os.path.join(DJANGO_ROOT, 'static/static')),
)


STATICFILES_FINDERS = (
    'django.contrib.staticfiles.finders.FileSystemFinder',
    'django.contrib.staticfiles.finders.AppDirectoriesFinder',
    'compressor.finders.CompressorFinder',
    'libs.compressor_assets.finders.AssetFinder',
    'libs.compressor_assets.finders.BowerFinder',
)


BOWER_COMPONENTS_ROOT = os.path.normpath(os.path.join(DJANGO_ROOT, 'static'))


COMPRESS_ENABLED = True
COMPRESS_PRECOMPILERS = ()
COMPRESS_SOURCE_ROOT = os.path.normpath(os.path.join(DJANGO_ROOT, 'static/assets'))
COMPRESS_OUTPUT_DIR = 'cache'

COMPRESS_CSS_FILTERS = [
    'compressor.filters.css_default.CssAbsoluteFilter',
    'compressor.filters.cssmin.CSSMinFilter',
]
