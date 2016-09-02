/* global $ toastr */

import Cookie from 'js-cookie';

const csrftoken = Cookie.get('csrftoken');

$.ajaxSetup({
	headers: {
		'X-CSRFToken': csrftoken
	}
});

$('form').ajaxForm({
	clearForm: true,
	success: showResponse
});

function showResponse() {
	toastr.success('Заявка успешно отправлена');
	$('.modal.in').modal('hide');
}
