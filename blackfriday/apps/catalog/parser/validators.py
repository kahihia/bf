class BaseValidator:
    _message = None
    is_warning = False

    def __init__(self, rule=None, blank=False, is_warning=False):
        self.blank = blank
        self.rule = rule
        self.is_warning = is_warning

    def __call__(self, value):
        return self.validate(value)

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
        super().__init__(self, *args, **kwargs)
        self._message = message

    def validate(self, value):
        return self.rule(value)


class GenericChainedValidator(BaseValidator):
    def __init__(self, message, *args, **kwargs):
        super().__init__(self, *args, **kwargs)
        self._message = message

    def validate(self, *columns):
        return self.rule(columns)
