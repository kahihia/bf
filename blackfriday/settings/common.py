import os
import sys

ADMINS = []

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
                'libs.templates.context_processors.showcase_enabled',
                'apps.advertisers.context_processors.moderation',
                'apps.catalog.context_processors.categories',
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
    'apps.specials',
    'apps.mailing',
    'apps.payment',
    'apps.showcase',

    'webpack_loader',
    'django_rq',
]

AUTH_USER_MODEL = 'users.User'
AUTHENTICATION_BACKENDS = (
    'apps.users.backends.ForceLoginBackend',
    'django.contrib.auth.backends.ModelBackend',
)

LOGIN_URL = '/admin/login/'
SHOW_LOGIN_ON_LANDING = False

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
    'наименование товара': 'name',
    'старая цена': 'old_price',
    'цена': 'price',
    'скидка': 'discount',
    'цена от': 'start_price',
    'валюта': 'currency',
    'производитель': 'brand',
    'категория': 'category',
    'страна производитель': 'country',
    'ссылка на товар': 'url',
    'ссылка на изображение товара': 'image',
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

LIMITS_RULES = {
    'banner_on_main': ['banner_on_main'],
    'banner_positions': ['banner_at_cat', 'additional_banner_at_cat'],
    'banners': [4],
    'categories': ['cats_num'],
    'category_backgrounds': ['cat_background'],
    'extra_banner_categories': ['additional_banner_at_cat'],
    'logo_categories': ['logo_at_cat', 'additional_logo_cat'],
    'main_backgrounds': ['main_background'],
    'products': ['products', 'additional_products'],
    'superbanner_categories': ['superbanner_at_cat', 'additional_superbanner_at_cat'],
    'superbanner_in_mailing': ['superbanner_at_mailing'],
    'superbanner_on_main': ['superbanner_on_main'],
    'superbanners': [1, 'superbanner_at_mailing'],
    'teasers': ['teaser', 'additional_teaser'],
    'teasers_on_main': ['teaser_on_main'],
    'vertical_banners': ['vertical_banner_on_main'],
    'banner_in_mailing': [1]
}

LIMITS_RULES_COEFS = {
    'additional_products': 100
}

SPECIAL_SUPPORTED_FORMATS = ['pdf']
RETAIL_ROCKET_CAT_SHIFT = 100

PAYMENT_SERVICE = {
    'login': 'realblackfriday-api',
    'password': 'realblackfriday'
}

HTML_VALIDATOR_ALLOWED_TAGS = {
    'h1', 'h2', 'h3', 'h4', 'h5', 'h6', 'br', 'blockquote', 'ul', 'li', 'b', 'i', 'u', 'ol', 'p', 'a', 'body', 'html',
    'div', 'span', 'strike'
}
MNOGO_LEADS_MANAGERS = []
RUSSIAN_PRODUCTS_KEYWORDS = (
    'россия', 'russia', 'рф', 'российская федерация'
)
SHOWCASE_ROOT = os.path.join(PROJECT_ROOT, 'showcase')
SHOWCASE_ENABLED = False

POST_RENDERING_EXEC_PATH = None
CHECK_IMAGE_URL = True
