class BaseValidator:
    _message = None
    is_warning = False

    def __init__(self, rule=None, blank=False, is_warning=False, message=None):
        self.blank = blank
        self.rule = rule
        self.is_warning = is_warning
        if message is not None:
            self._message = message

    def __call__(self, value, context):
        if not value:
            return None
        return self.validate(value=value, context=context)

    def validate(self, value, context):
        raise NotImplementedError

    @property
    def message(self):
        if self._message is not None:
            return self._message
        return self.get_message()

    def get_message(self):
        raise NotImplementedError


class GenericValidator(BaseValidator):
    def __call__(self, context, **cleaned_data):
        return self.rule(context=context, **cleaned_data)
