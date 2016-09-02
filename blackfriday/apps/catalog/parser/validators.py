class BaseValidator:
    _message = None
    is_warning = False

    def __init__(self, rule=None, blank=False, is_warning=False):
        self.blank = blank
        self.rule = rule
        self.is_warning = is_warning

    def __call__(self, *values, **kwargs):
        return self.validate(*values, **kwargs)

    def validate(self, value):
        raise NotImplementedError

    @property
    def message(self):
        if self._message is not None:
            return self._message
        return self.get_message()

    def get_message(self):
        raise NotImplementedError


class GenericValidator(BaseValidator):
    def __init__(self, message, *args, **kwargs):
        super().__init__(*args, **kwargs)
        self._message = message

    def validate(self, value):
        return self.rule(value)


class GenericChainedValidator(BaseValidator):
    def __init__(self, message, *args, **kwargs):
        self._message = message
        super().__init__(*args, **kwargs)

    def validate(self, **cleaned_data):
        return self.rule(**cleaned_data)
