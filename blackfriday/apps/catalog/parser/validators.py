import inspect


class BaseValidator:
    _message = None
    is_warning = False
    required = False

    def __init__(self, rule=None, is_warning=False, message=None, required=False):
        self.rule = rule
        self.is_warning = is_warning
        self.required = self.required or required
        if message is not None:
            self._message = message

    def __call__(self, value, context):
        if not value and not self.required:
            return None
        return self.validate(value=value, context=context)

    def validate(self, value, context=None):
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
        signature = inspect.signature(self.rule)
        if 'context' in signature.parameters:
            return self.rule(context=context, **cleaned_data)
        else:
            return self.rule(**cleaned_data)
