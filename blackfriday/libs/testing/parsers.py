import json
from pytest_bdd.parsers import parse


class AsciiTableParser(parse):
    def parse_arguments(self, name):
        data = super().parse_arguments(name)
        table = data.get('data')
        rows = [row.strip().split('|')[1:-1] for row in table.split('\n')]
        headers = [head.strip() for head in rows[0]]
        data['data'] = [{key: json.loads(value.strip()) for key, value in zip(headers, row)} for row in rows[1:]]
        return data
