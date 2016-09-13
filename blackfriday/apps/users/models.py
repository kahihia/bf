from uuid import uuid4

from django.conf import settings
from django.contrib.auth import models
from django.contrib.auth.models import AbstractBaseUser, BaseUserManager
from django.core.mail import send_mail
from django.db import models
from django.template.loader import render_to_string
from django.utils import timezone

from apps.advertisers.models import AdvertiserProfile


class UserManager(BaseUserManager):
    use_in_migrations = True

    def _create_user(self, email, password, **extra_fields):
        if not email:
            raise ValueError('The given email must be set')
        email = self.normalize_email(email).lower()
        user = self.model(email=email, is_active=True, **extra_fields)
        user.set_password(password)
        user.save(using=self._db)
        return user

    def create_user(self, email=None, password=None, **extra_fields):
        extra_fields.setdefault('is_admin', False)
        return self._create_user(email, password, **extra_fields)

    def create_superuser(self, email, password, **extra_fields):
        extra_fields.setdefault('is_admin', True)
        if extra_fields.get('is_admin') is not True:
            raise ValueError('Admin must have is_admin=True.')
        return self._create_user(email, password, **extra_fields)


class TokenType:
    NONE = 0
    VERIFICATION = 1
    REGISTRATION = 2


class Token(models.Model):
    TYPE_CHOICES = (
        (TokenType.NONE, 'None'),
        (TokenType.VERIFICATION, 'Verification'),
        (TokenType.REGISTRATION, 'Registration'),
    )

    expires = models.DateTimeField(verbose_name='Истекает')
    user = models.ForeignKey(settings.AUTH_USER_MODEL, related_name='tokens', verbose_name='Пользователь')
    token = models.CharField(max_length=100, unique=True, verbose_name='Токен')
    type = models.IntegerField(default=TokenType.NONE, choices=TYPE_CHOICES, verbose_name='Тип')

    @property
    def is_expired(self):
        return self.expires < timezone.now()

    class Meta:
        verbose_name = 'Пользовательский токен'
        verbose_name_plural = 'Пользовательские токены'

    def __str__(self):
        return self.token

    @classmethod
    def _generate(cls):
        token = uuid4().hex
        while cls.objects.filter(token=token).exists():
            token = uuid4().hex
        return token

    @classmethod
    def create(cls, user, ttl=72, type=None):
        expiration = timezone.now() + timezone.timedelta(hours=ttl)
        user_token = cls.objects.create(token=cls._generate(), user=user, expires=expiration, type=type)
        return user_token.token

    @classmethod
    def invalidate(cls, user, type=None):
        now = timezone.now()
        cls.objects.filter(user=user, expires__gte=now, **({'type': type} if type else {})).update(expires=now)

    @classmethod
    def get_token(cls, token, type=None):
        try:
            return cls.objects.get(token=token, **({'type': type} if type else {}))
        except cls.DoesNotExist:
            return None


class User(AbstractBaseUser):
    email = models.EmailField(unique=True, blank=False, verbose_name='Электронная почта')
    name = models.CharField(max_length=120, null=True, blank=True, verbose_name='Имя')

    datetime_created = models.DateTimeField(auto_now_add=True, verbose_name='Время создания')
    datetime_updated = models.DateTimeField(auto_now=True, verbose_name='Время обновления')

    is_active = models.BooleanField(default=False, verbose_name='Пользователь активен')
    is_admin = models.BooleanField(default=False, verbose_name='Администратор')
    profile = models.OneToOneField(AdvertiserProfile, null=True, blank=True, on_delete=models.SET_NULL,
                                   verbose_name='Профиль рекламодателя')

    USERNAME_FIELD = 'email'

    objects = UserManager()

    @property
    def is_staff(self):
        return self.is_admin

    @property
    def is_superuser(self):
        return self.is_admin

    @property
    def role(self):
        if self.is_admin:
            return 'admin'
        if self.profile:
            return 'advertiser'
        return 'manager'

    @role.setter
    def role(self, value):
        self.is_admin = (value == 'admin')
        if value == 'advertiser':
            if not self.profile:
                self.profile = AdvertiserProfile.objects.create()
        elif self.profile:
            self.profile.delete()
            self.profile = None

    @property
    def owner_id(self):
        return self.id

    class Meta:
        verbose_name = 'Пользователь'
        verbose_name_plural = 'Пользователи'

    def __str__(self):
        return self.email

    def get_full_name(self):
        return self.name

    def get_short_name(self):
        return self.name

    def has_perm(self, perm, obj=None):
        return self.is_admin

    def has_perms(self, perm_list, obj=None):
        return self.is_admin

    def has_module_perms(self, app_label):
        return self.is_admin

    def activate(self):
        self.is_active = True
        self.save()
