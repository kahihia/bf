from .parser import BaseValidator


class IsNumeric(BaseValidator):
    _message = 'Отсутствует числовое значение'

    def validate(self, value, **kwargs):
        try:
            float(value)
        except:
            return False
        return True


class MaxValue(BaseValidator):

    def validate(self, value, **kwargs):
        if isinstance(value, str):
            return None
        return self.rule >= value

    def get_message(self):
        return 'Превышен максимум: {}'.format(self.rule)


class Choices(BaseValidator):

    def validate(self, value, **kwargs):
        return value in self.rule

    def get_message(self):
        return 'Значение должно соответствовать одному из {}'.format(', '.join(self.rule))


class Substring(BaseValidator):

    def validate(self, value, **kwargs):
        if isinstance(self.rule, str):
            return self.rule in value
        return any(map(lambda r: r in value, self.rule))

    def get_message(self):
        return 'Строка должна содержать {}'.format(self.rule)


class UtmRequired(BaseValidator):
    _message = 'Отсутствуют utm метки'

    def validate(self, value, **kwargs):
        return all([utm in value for utm in ['utm_source', 'utm_medium', 'utm_campaign']])


class Length(BaseValidator):

    def validate(self, value, **kwargs):
        return len(value) <= self.rule

    def get_message(self):
        return 'Длина строки не должна превышать {}'.format(self.rule)


class Required(BaseValidator):
    _message = 'Обязательное поле'
    required = True

    def validate(self, value, **kwargs):

        return bool(value)
