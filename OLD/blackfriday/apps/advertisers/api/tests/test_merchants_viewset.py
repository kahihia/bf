import pytest


pytestmark = pytest.mark.django_db


def test_get_statistics_report(admin_logged_client, merchant):
    response = admin_logged_client.get(
        '/api/merchants/{id}/statistics-report/'.format(id=merchant.id))
    assert response.status_code == 200


def test_get_act_report_report(admin_logged_client, merchant):
    response = admin_logged_client.get(
        '/api/merchants/{id}/act-report/'.format(id=merchant.id))
    assert response.status_code == 200
