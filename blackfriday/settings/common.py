import os
import sys

ADMINS = [
    ('Artem', 'sukhanon@220-volt.ru'),
    ('Nikita', 'merkulov.nikita@220-volt.ru'),
    ('Victor', 'vsmirnov@220-volt.ru')
]

DEBUG = False
ALLOWED_HOSTS = []

DJANGO_ROOT = os.path.dirname(os.path.dirname(os.path.abspath(__file__)))
PROJECT_ROOT = os.path.dirname(DJANGO_ROOT)

sys.path.append(DJANGO_ROOT)

SECRET_KEY = '_3-o!9msf++1k*hlyf9-+@x7lk5jc5^^zm8%0%sa$_x!36-@&j'

LANGUAGE_CODE = 'ru-ru'
TIME_ZONE = 'UTC'
USE_I18N = True
USE_L10N = True
USE_TZ = True

ROOT_URLCONF = 'blackfriday.urls'

WSGI_APPLICATION = 'blackfriday.wsgi.application'

TEMPLATES = [
    {
        'BACKEND': 'django.template.backends.django.DjangoTemplates',
        'DIRS': [
            os.path.normpath(os.path.join(DJANGO_ROOT, 'templates'))
        ],
        'APP_DIRS': True,
        'OPTIONS': {
            'context_processors': [
                'django.template.context_processors.debug',
                'django.template.context_processors.request',
                'django.contrib.auth.context_processors.auth',
                'django.contrib.messages.context_processors.messages',
                'libs.recaptcha.context_processors.captcha_keys',
                'libs.templates.context_processors.site_url',
            ],
        },
    },
]

# Override in local.py
DATABASES = {
    'default': {
        'ENGINE': 'django.db.backends.postgresql_psycopg2',
        'NAME': 'blackfriday',
        'USER': 'blackfriday',
        'PASSWORD': 'blackfriday',
        'HOST': '127.0.0.1'
    }
}

MIDDLEWARE = [
    'django.middleware.security.SecurityMiddleware',
    'django.contrib.sessions.middleware.SessionMiddleware',
    'django.middleware.common.CommonMiddleware',
    'django.middleware.csrf.CsrfViewMiddleware',
    'django.contrib.auth.middleware.AuthenticationMiddleware',
    'django.contrib.messages.middleware.MessageMiddleware',
    'django.middleware.clickjacking.XFrameOptionsMiddleware',
]

INSTALLED_APPS = [
    'django.contrib.auth',
    'django.contrib.contenttypes',
    'django.contrib.sessions',
    'django.contrib.messages',
    'django.contrib.staticfiles',
    'django.contrib.admin',

    'rest_framework',
    'apps.landing',
    'apps.users',
    'apps.catalog',
    'apps.advertisers',
    'apps.banners',
    'apps.promo',
    'apps.leads',
    'apps.orders',
    'apps.mediafiles',

    'webpack_loader',
]

AUTH_USER_MODEL = 'users.User'
AUTHENTICATION_BACKENDS = (
    'apps.users.backends.ForceLoginBackend',
    'django.contrib.auth.backends.ModelBackend',
)

LOGIN_URL = '/admin/login/'
DEFAULT_FROM_EMAIL = 'noreply@realblackfriday.com'

VERIFICATION = {
    'subject': 'RealBlackFriday — активация учётной записи',
    'from_email': DEFAULT_FROM_EMAIL,
}

VERIFICATION_TTL_HOURS = 24
INVOICE_TTL_DAYS = 5

MANAGERS = []
PROMO_MANAGERS = []

CURRENCY_IDS = ('rur', 'usd', 'uah', 'kzt')
DEFAULT_CATEGORY_SLUG = 'raznoe'
DEFAULT_CATEGORY_NAME = 'Разное'

TEST_RUNNER = 'libs.testing.runner.PytestTestRunner'
LOGIN_REDIRECT_URL = '/admin/'

SITE_URL = 'https://realblackfriday.ru'

PRODUCT_FILE_COLUMNS_MAPPING = {
    'name': 'name',
    'oldprice': 'old_price',
    'price': 'price',
    'discount': 'discount',
    'startprice': 'start_price',
    'currencyid': 'currency',
    'vendor': 'brand',
    'category': 'category',
    'countryoforigin': 'country',
    'url': 'url',
    'image': 'image',
}
