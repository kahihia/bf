from rest_framework import serializers
from ..models import Image


class ImageSerializer(serializers.ModelSerializer):
    image = serializers.ImageField(
        error_messages={
            'invalid_image': 'format',
        }
    )

    class Meta:
        model = Image
        fields = ('image', 'id')

    def validate_image(self, value):
        try:
            expected_width = int(self.context['request'].query_params.get('exact_width', 0))
        except ValueError:
            expected_width = 0
        try:
            expected_height = int(self.context['request'].query_params.get('exact_height', 0))
        except ValueError:
            expected_height = 0

        if expected_height or expected_width:
            errors = []
            if expected_width and expected_width != value.image.width:
                errors.append('exact_width')
            if expected_height and expected_height != value.image.height:
                errors.append('exact_height')

            if errors:
                raise serializers.ValidationError(errors)
        return value
