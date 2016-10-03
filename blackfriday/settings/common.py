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
    'django_rq',
]

AUTH_USER_MODEL = 'users.User'
AUTHENTICATION_BACKENDS = (
    'apps.users.backends.ForceLoginBackend',
    'django.contrib.auth.backends.ModelBackend',
)

LOGIN_URL = '/admin/login/'
DEFAULT_FROM_EMAIL = 'no-reply@realblackfriday.ru'

VERIFICATION_SUBJ = 'RealBlackFriday — активация учётной записи'
VERIFICATION_TTL_HOURS = 24
INVOICE_TTL_DAYS = 5
INVOICE_NEW_LIMIT = 5

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

BANK_ACCOUNT = {
    'bank': 'ФИЛИАЛ "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК" Г. САНКТ-ПЕТЕРБУРГ',
    'name': 'ООО "Эксперт Таун"',
    'inn': '7801203510',
    'kpp': '780101001',
    'legal_address': '199178, г.Санкт-Петербург, 18-я линия В.О. д.29 , лит Ж, пом 2-Н',
    'address': '199178, г.Санкт-Петербург, 18-я линия В.О. д.29 , лит.Д.',
    'account': '40702810632230001020, в филиале "САНКТ-ПЕТЕРБУРГСКИЙ" АО "АЛЬФА-БАНК"',
    'korr': '30101810600000000786',
    'bik': '044030786',
    'head': 'Тимофеев К. И.',
    'accountant': 'Шавкеро А. А.',
}

EXPERT_SENDER = False
EXPERT_SENDER_URL = 'https://api.esv2.com'
EXPERT_SENDER_KEY = 'GNauUObtBmX85IVs5VMf'
EXPERT_SENDER_LIST = 44

RQ_QUEUES = {
    'default': {
        'HOST': 'localhost',
        'PORT': 6379,
        'DB': 0
    }
}
