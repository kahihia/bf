from rest_framework import serializers

from ..models import LandingLogo


class LandingLogoSerializer(serializers.ModelSerializer):
    class Meta:
        model = LandingLogo
        fields = ('id', 'image', 'url', 'position')
        read_only_fields = ('id', 'position')

    def create(self, validated_data):
        last = LandingLogo.objects.order_by('position').last()
        validated_data['position'] = 0
        if last:
            validated_data['position'] = last.position + 1
        return super().create(validated_data)
