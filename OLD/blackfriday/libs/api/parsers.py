from djangorestframework_camel_case.util import underscoreize
from rest_framework.parsers import MultiPartParser, FormParser, DataAndFiles


def underscore_data_and_files(data_and_files):
    data = underscoreize(data_and_files.data)
    files = underscoreize(data_and_files.files)

    for data_dict in [data, files]:
        for key in data_dict:
            if data_dict[key] == 'null':
                data_dict[key] = None

    return DataAndFiles(data=data, files=files)


class CamelCaseMultiPartParser(MultiPartParser):
    def parse(self, stream, media_type=None, parser_context=None):
        data = super().parse(stream, media_type, parser_context)
        data = underscore_data_and_files(data)
        return data


class CamelCaseFormParser(FormParser):
    def parse(self, stream, media_type=None, parser_context=None):
        data = super().parse(stream, media_type, parser_context)
        data = underscoreize(data)
        for key in data:
            if data[key] == 'null':
                data[key] = None
        return data
