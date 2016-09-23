import pytest
import json

from django.core.urlresolvers import reverse

from apps.leads.tests.factories import AdvertiserRequestFactory
from apps.leads.models import AdvertiserRequestStatus, AdvertiserRequest

pytestmark = pytest.mark.django_db


def test_patch_status_changed_to_in_progress_expected_current_user_become_responsible(admin_logged_client, admin_user):
    adv_req = AdvertiserRequestFactory.create()
    response = admin_logged_client.patch(
        reverse('api:leads:applications-detail', args=(adv_req.id, )),
        data=json.dumps({'status': AdvertiserRequestStatus.in_process}),
        content_type='application/json')
    assert response.status_code == 200
    assert AdvertiserRequest.objects.get(id=adv_req.id).user_responsible.id == admin_user.id


def test_patch_given_AR_with_responsible_user_patched_by_non_administrator_expect_403(
        operator_logged_client, admin_user, operator_user):
    adv_req = AdvertiserRequestFactory.create(user_responsible=admin_user, status=AdvertiserRequestStatus.in_process)
    response = operator_logged_client.patch(
        reverse('api:leads:applications-detail', args=(adv_req.id, )),
        data=json.dumps({'status': AdvertiserRequestStatus.active}),
        content_type='application/json')
    assert response.status_code == 403
    assert AdvertiserRequest.objects.get(id=adv_req.id).status == AdvertiserRequestStatus.in_process


def test_patch_given_AR_with_responsible_user_patched_by_administrator_expect_ok(
        admin_logged_client, admin_user, operator_user):
    adv_req = AdvertiserRequestFactory.create(
        user_responsible=operator_user, status=AdvertiserRequestStatus.in_process)
    response = admin_logged_client.patch(
        reverse('api:leads:applications-detail', args=(adv_req.id, )),
        data=json.dumps({'status': AdvertiserRequestStatus.active}),
        content_type='application/json')
    assert response.status_code == 200
    assert AdvertiserRequest.objects.get(id=adv_req.id).status == AdvertiserRequestStatus.active
