import re


# copypaste from djangorestframeworkcamelcase
def underscoreToCamel(match):
    return match.group()[0] + match.group()[2].upper()


def camelcase_error_output(field, message):
    return {
        # copypaste from djangorestframeworkcamelcase
        'field': re.sub(r"[a-z]_[a-z]", underscoreToCamel, field),
        'message': message
    }

