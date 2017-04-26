from django.contrib.auth import get_user_model


class ForceLoginBackend:
    def get_user(self, user_id):
        User = get_user_model()
        try:
            return User.objects.get(pk=user_id)
        except User.DoesNotExist:
            return None

    def authenticate(self, user=None):
        return user
