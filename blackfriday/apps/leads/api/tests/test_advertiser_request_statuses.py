import json
import pytest

from django.core.urlresolvers import reverse

from libs.testing.helpers import pytest_generate_tests

from apps.leads.tests.factories import AdvertiserRequestFactory
from apps.leads.models import AdvertiserRequestStatus, AdvertiserRequest

pytestmark = pytest.mark.django_db


scenarios = [
    (
        'from new to in_process',
        {
            'from_status': AdvertiserRequestStatus.new,
            'to_status': AdvertiserRequestStatus.in_process,
            'status_code': 200,
            'changed': True
        }
    ),
    (
        'from in_process to active',
        {
            'from_status': AdvertiserRequestStatus.in_process,
            'to_status': AdvertiserRequestStatus.active,
            'status_code': 200,
            'changed': True
        }
    ),
    (
        'from in_process to rejected',
        {
            'from_status': AdvertiserRequestStatus.in_process,
            'to_status': AdvertiserRequestStatus.rejected,
            'status_code': 200,
            'changed': True
        }
    ),
    (
        'from new to active',
        {
            'from_status': AdvertiserRequestStatus.new,
            'to_status': AdvertiserRequestStatus.active,
            'status_code': 400,
            'changed': False
        }
    ),
    (
        'from new to rejected',
        {
            'from_status': AdvertiserRequestStatus.new,
            'to_status': AdvertiserRequestStatus.rejected,
            'status_code': 400,
            'changed': False
        }
    ),
    (
        'from rejected to new',
        {
            'from_status': AdvertiserRequestStatus.rejected,
            'to_status': AdvertiserRequestStatus.new,
            'status_code': 400,
            'changed': False
        }
    ),
    (
        'from in_process to new',
        {
            'from_status': AdvertiserRequestStatus.in_process,
            'to_status': AdvertiserRequestStatus.new,
            'status_code': 400,
            'changed': False
        }
    ),
    (
        'from active to new',
        {
            'from_status': AdvertiserRequestStatus.active,
            'to_status': AdvertiserRequestStatus.new,
            'status_code': 400,
            'changed': False
        }
    ),
]


class TestAdvertiserRequestStatuses:
    scenarios = scenarios

    def test_patch_status(self, admin_logged_client, admin_user, from_status, to_status, status_code, changed):
        adv_req = AdvertiserRequestFactory.create(
            user_responsible=admin_user, status=from_status)
        response = admin_logged_client.patch(
            reverse('api:leads:applications-detail', args=(adv_req.id, )),
            data=json.dumps({'status': to_status}),
            content_type='application/json')
        assert response.status_code == status_code
        assert (AdvertiserRequest.objects.get(id=adv_req.id).status == to_status) is changed
