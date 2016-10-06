/* global $ toastr */

import Cookie from 'js-cookie';
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
	toastr.success('Заявка успешно отправлена');
	$('.modal.in').modal('hide');

	if (data.organizationName || data.phone) {
		return;
	}

	// Floctory
	// Обновляет информацию блока для Floctory
	var name = data.name || null;
	var email = data.email || null;

	createFloctory.update(name, email);
}

function showError(resp) {
	if (resp.status !== 400) {
		toastr.error('Не удалось отправить заявку');
		return;
	}

	if (resp.responseJSON && resp.responseJSON.nonFieldErrors) {
		toastr.warning('Заявка с таким адресом электронной почты уже в работе');
	}
}
