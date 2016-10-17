import inspect
from apps.catalog.parser.utils import camelcase_error_output


class Column(object):
    def __init__(self, field, pipes=None, validators=None, error_output=None):
        self.pipes = pipes or []
        self.validators = validators or []
        self.field = field
        self._error_output = error_output

    def __str__(self):
        return self.field

    def error_output(self, field, message):
        if self._error_output:
            return self._error_output(field, message)
        return camelcase_error_output(field, message)

    def clean_value(self, value, context):
        if value is None and not (self.pipes and hasattr(self.pipes[0], 'null') and self.pipes[0].null):
            return None
        try:
            for func in self.pipes:
                try:
                    signature = inspect.signature(func)
                    if 'context' in signature.parameters:
                        value = func(value, context)
                    else:
                        value = func(value)
                except ValueError:
                    value = func(value)
        except:
            return str(value)
        else:
            return value

    def validate(self, row, context):
        value = self.clean_value(row.get(self.field), context)
        errors = []
        warnings = []
        for validator in self.validators:
            parameters = inspect.signature(validator).parameters
            kwargs = {'value' if 'value' in parameters else self.field: value}
            if 'context' in parameters:
                kwargs['context'] = context

            if validator(**kwargs) is False:
                result = self.error_output(self.field, validator.message)
                warnings.append(result) if validator.is_warning else errors.append(result)
        return {self.field: value}, errors, warnings


class Grouped(object):
    def __init__(self, columns, validators=None, error_output=None):
        self.columns = columns
        self.validators = validators or []
        self._error_output = error_output

    def error_output(self, field, message):
        if self._error_output:
            return self._error_output(field, message)
        return camelcase_error_output(field, message)

    def validate(self, row, context):
        errors = []
        warnings = []
        cleaned_data = {}
        for col in self.columns:
            data, errors, warnings = col.validate(row, context=context)
            errors.extend(errors)
            warnings.extend(warnings)
            cleaned_data.update(data)
        for validator in self.validators:
            if validator(**cleaned_data, context=context) is False:
                result = [self.error_output(col.field, validator.message) for col in self.columns]
                warnings.extend(result) if validator.is_warning else errors.extend(result)

        return cleaned_data, errors, warnings


class Row(object):
    _columns = ()

    def __init__(self, row, context):
        self._row = {key.lower(): value for key, value in row.items()}
        self.warnings = []
        self.errors = []
        self.cleaned_data = {}
        self.context = context

    def validate(self):
        for col in self._columns:
            cleaned_data, errors, warnings = col.validate(self._row, self.context)
            self.errors.extend(errors)
            self.warnings.extend(warnings)
            self.cleaned_data.update(cleaned_data)
        return self.cleaned_data, self.errors, self.warnings
