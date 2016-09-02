class Column:
    def __init__(self, field, pipes=None, validators=None):
        self.pipes = pipes or []
        self.validators = validators or []
        self.field = field

    def __str__(self):
        return self.field

    def clean_value(self, value):
        if not value:
            return None
        try:
            for func in self.pipes:
                value = func(value)
        except:
            return str(value)
        else:
            return value

    def validate(self, row):
        value = self.clean_value(row.get(self.field))
        errors = []
        warnings = []
        for validator in self.validators:
            if validator(value) is False:
                result = {
                    'field': self.field,
                    'message': validator.message
                }
                warnings.append(result) if validator.is_warning else errors.append(result)
        return {self.field: value}, errors, warnings


class Grouped:
    def __init__(self, validators=None, *columns):
        self.columns = columns
        self.validators = validators or []

    def validate(self, row):
        errors = []
        warnings = []
        cleaned_data = {}
        for col in self.columns:
            data, errors, warnings = col.validate(row)
            errors.extend(errors)
            warnings.extend(warnings)
            cleaned_data.update(data)
        for validator in self.validators:
            if not validator(**cleaned_data):
                result = [
                    {
                        'field': col.field,
                        'message': validator.message
                    } for col in self.columns
                ]
                warnings.extend(result) if validator.is_warning else errors.extend(result)

        return cleaned_data, errors, warnings


class Row:
    _columns = ()

    def __init__(self, row):
        self._row = {key.lower(): value for key, value in row.items()}
        self.warnings = []
        self.errors = []
        self.cleaned_data = {}

    def validate(self):
        for col in self._columns:
            cleaned_data, errors, warnings = col.validate(self._row)
            self.errors.extend(errors)
            self.warnings.extend(warnings)
            self.cleaned_data.update(cleaned_data)
        return self.cleaned_data, self.errors, self.warnings
