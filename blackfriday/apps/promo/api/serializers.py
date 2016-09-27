from rest_framework import serializers
from rest_framework.exceptions import ValidationError

from ..models import Option, Promo, PromoOption


class PromoTinySerializer(serializers.ModelSerializer):
    class Meta:
        model = Promo
        fields = ('id', 'name', 'price')


class OptionSerializer(serializers.ModelSerializer):
    max_value = serializers.IntegerField(source='max_count')
    promos_available_for = PromoTinySerializer(source='available_in_promos', many=True)

    class Meta:
        model = Option
        fields = ('id', 'name', 'tech_name', 'price', 'image', 'is_required', 'is_boolean', 'is_available', 'max_value',
                  'promos_available_for')

    def to_representation(self, instance):
        representation = super().to_representation(instance)
        if instance.is_required:
            representation['promos_available_for'] = []
        return representation


class PromoOptionSerializer(serializers.ModelSerializer):
    id = serializers.PrimaryKeyRelatedField(queryset=Option.objects.all(), source='option')

    name = serializers.CharField(read_only=True, source='option.name')
    image = serializers.ImageField(read_only=True, source='option.image')
    is_boolean = serializers.BooleanField(read_only=True, source='option.is_boolean')

    class Meta:
        model = PromoOption
        fields = ('id', 'name', 'image', 'value', 'is_boolean')


class PromoSerializer(serializers.ModelSerializer):
    options = PromoOptionSerializer(many=True)

    class Meta:
        model = Promo
        fields = ('id', 'name', 'price', 'options', 'is_custom')
        extra_kwargs = {'is_custom': {'read_only': True}}

    def validate_options(self, value):
        options = [x['option'] for x in value]
        if not options:
            raise ValidationError('Пустой список опций')
        if len(set(options)) < len(options):
            raise ValidationError('Опции повторяются')
        return value

    def create(self, validated_data):
        promo_options = validated_data.pop('options')
        promo = super().create(validated_data)
        PromoOption.objects.bulk_create(PromoOption(promo=promo, **kw) for kw in promo_options)
        return promo


class CustomPromoRequestSerializer(serializers.Serializer):
    name = serializers.CharField()
    phone = serializers.CharField()
    message = serializers.CharField()
