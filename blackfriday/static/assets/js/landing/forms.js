/* global $ toastr */

import Cookie from 'js-cookie';
import MESSAGES from './messages.js';
import trackAdmitAd from './admitad.js';
var createFloctory = require('./flocktory.js');

const csrftoken = Cookie.get('csrftoken');

$.ajaxSetup({
	headers: {
		'X-CSRFToken': csrftoken
	}
});

$('form').ajaxForm({
	clearForm: true,
	success: showResponse,
	error: showError
});

function showResponse(data) {
	toastr.success(MESSAGES.subscribeSuccess);
	$('.modal.in').modal('hide');

	// если это форма заявки, то отбой
	if (data.organizationName || data.phone) {
		return;
	}

	// Floctory
	// Обновляет информацию блока для Floctory
	var name = data.name || null;
	var email = data.email || null;

	createFloctory.update(name, email);
	createFloctory.renderMgm();

	// AdmitAd
	trackAdmitAd();
}

function showError(resp) {
	if (resp.status !== 400) {
		toastr.error(MESSAGES.subscribeError);
		return;
	}

	if (resp.responseJSON && resp.responseJSON.nonFieldErrors) {
		toastr.warning(MESSAGES.subscribeExists);
	}
}
