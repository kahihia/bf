import collections


def flatten(x):
    ans = []
    for i in x:
        if isinstance(i, collections.Iterable):
            ans.extend(flatten(i))
        else:
            ans.append(i)
    return ans


def _collect(instance, errors, warnings):
    if errors:
        instance.errors.extend(errors)
    if warnings:
        instance.warnings.extend(warnings)


class Column:
    def __init__(self, field, pipes=None, validators=None):
        self.pipes = pipes or []
        self.validators = validators or []
        self.field = field
        self.errors = []
        self.warnings = []

    def clean_value(self, value):
        self.value = self._clean_value(value)

    def _clean_value(self, value):
        if not value:
            return None
        try:
            for func in self.pipes:
                value = func(value)
        except:
            return str(value)
        else:
            return value

    def validate(self):
        for validator in self.validators:
            if not validator(self.value):
                result = {
                    'field': self.field,
                    'message': validator.message
                }
                self.warnings.append(result) if validator.is_warning else self.errors.append(result)
        return self.errors, self.warnings


class Related:
    def __init__(self, validators=None, *columns):
        self.columns = columns
        self.validators = validators or []
        self.errors = []
        self.warnings = []

    def __iter__(self):
        for col in self.columns:
            yield col

    def validate(self):
        for col in self.columns:
            self._collect(col.validate())
        for validator in self.validators:
            _collect(self, validator.validate(self.columns))
            self._collect(validator.validate(self.columns))
        return self.errors, self.warnings


class Row:
    _columns = ()

    @property
    def columns(self):
        return [col for col in flatten(self._columns)]

    def __init__(self, row):
        self.warnings = []
        self.errors = []
        for col in self.columns:
            col.clean_value(row.get(col.field))

    def validate(self, row):
        errors = []
        warnings = []
        for col in self._columns:
            _collect(self, col.validate())
        return errors, warnings
