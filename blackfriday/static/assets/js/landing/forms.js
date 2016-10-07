/* global $ toastr */

import Cookie from 'js-cookie';
import MESSAGES from './messages.js';
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

	if (data.organizationName || data.phone) {
		return;
	}

	// Floctory
	createFloctory.renderMgm();
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
