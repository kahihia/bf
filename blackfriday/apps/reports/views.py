import io
import weasyprint

from django.template.loader import render_to_string


def create_report(report_name):
    output = io.BytesIO()
    weasyprint.HTML(
        string=render_to_string(
            '{}.html'.format(report_name),
            {}
        )
    ).write_pdf(output)
    output.seek(0)
    with open('{}.pdf'.format(report_name), 'wb') as f:
        f.write(output.read())


def get_act_report(user):
    create_report('act_report')


def get_statistics(user):
    create_report('statistics')
