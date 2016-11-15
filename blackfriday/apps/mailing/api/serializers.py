from rest_framework import serializers
from libs.api.validators import html_validator

from apps.landing.models import LandingLogo
from apps.mediafiles.models import Image


class BannerSerializer(serializers.Serializer):
    id = serializers.PrimaryKeyRelatedField(queryset=Image.objects.all(), write_only=True)
    url = serializers.URLField()

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['image'] = str(instance['id'])
        return data


class ButtonSerializer(serializers.Serializer):
    text = serializers.CharField()
    url = serializers.URLField()


class LogoMailingSerializer(serializers.Serializer):
    top_banner = BannerSerializer(required=False)
    middle_banner = BannerSerializer(required=False)

    top_text = serializers.CharField(required=False, validators=[html_validator])
    bottom_text = ButtonSerializer(required=False)

    include_admitad = serializers.BooleanField(write_only=True, required=False)
    links_to_main = serializers.BooleanField(required=False)

    def to_representation(self, instance):
        data = super().to_representation(instance)
        data['logos'] = LandingLogo.objects.all()
        if not instance.get('include_admitad'):
            data['logos'] = data['logos'].exclude(url__icontains='admitad')
        return data


class BannersMailingSerializer(serializers.Serializer):
    top_banner = BannerSerializer(required=False)
    middle_banner = BannerSerializer(required=False)

    top_text = serializers.CharField(required=False, validators=[html_validator])
    bottom_text = ButtonSerializer(required=False)
