from rest_framework import serializers

from apps.specials.models import Special


class SpecialSerializer(serializers.ModelSerializer):

    class Meta:
        model = Special
        fields = ('id', 'name', 'description', 'document')
