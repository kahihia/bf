from .parser import BaseValidator


class IsNumeric(BaseValidator):
    _message = 'Отсутствует числовое значение'

    def validate(self, value):
        if not value:
            return self.blank

        try:
            float(value)
        except:
            return False
        return True


class MaxValue(BaseValidator):

    def validate(self, value):
        if not value:
            return self.blank
        if isinstance(value, str):
            return False
        return self.rule >= value

    def get_message(self):
        return 'Превышен максимум: {}'.format(self.rule)


class Choices(BaseValidator):

    def validate(self, value):
        if not value:
            return self.blank
        return value in self.rule

    def get_message(self):
        return 'Значение должно соответствовать одному из {}'.format(', '.join(self.rule))


class Substring(BaseValidator):

    def validate(self, value):
        if not value:
            return self.blank
        if isinstance(self.rule, str):
            return self.rule in value
        return any(map(lambda r: r in value, self.rule))

    def get_message(self):
        return 'Строка должна содержать {}'.format(self.rule)


class UtmRequired(Substring):
    _message = 'Отсутствуют utm метки'

    def validate(self, value):
        if not value:
            return self.blank
        return all([utm in value for utm in ['utm_source', 'utm_medium', 'utm_campaign']])


class Length(BaseValidator):

    def validate(self, value):
        return len(value) < self.rule

    def get_message(self):
        return 'Длина строки не должна превышать {}'.format(self.rule)


class Required(BaseValidator):
    _message = 'Обязательное поле'

    def validate(self, value):
        return bool(value)
