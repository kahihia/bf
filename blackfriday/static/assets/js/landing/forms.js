/* global $ document toastr */

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

$('.js-form-ajax').ajaxForm({
	clearForm: true,
	success: showResponse,
	error: showError
});

$(document)
	.on('submit', 'form#apply-form-1', function (event) {
		let form = event.target;

		form.body.value =
			`Имя: ${form.name.value}\n` +
			`Название организации: ${form.organizationName.value}\n` +
			`Контактный телефон: ${form.phone.value}\n` +
			`E-mail: ${form.email.value}`;

		if (form.comment.value) {
			form.body.value += `\nКомментарий:\n${form.comment.value}`;
		}
	})
	.on('submit', 'form', function (event) {
		setTimeout(function () {
			event.target.reset();
		}, 0);
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
