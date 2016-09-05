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
    'blackfriday',
    'apps.users',
    'apps.catalog',
    'apps.advertisers',
    'apps.banners',
    'apps.promo',
    'apps.leads',

    'webpack_loader',
]

AUTH_USER_MODEL = 'users.User'
LOGIN_URL = '/admin/login/'

VERIFICATION = {
    'subject': 'RealBlackFriday — активация учётной записи',
    'from_email': 'test@test.ru',
}

VERIFICATION_TTL_HOURS = 24

MANAGERS = []
