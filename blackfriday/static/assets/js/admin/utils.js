/* global window toastr _ */

import formatThousands from 'format-thousands';

const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

export function resolveImgPath(path, type) {
	if (!type) {
		return `${ENV.imgBaseUrl}${path}`;
	}

	return `${ENV.imgStaticBaseUrl}${path}`;
}

export function hasRole(role) {
	return (ENV.userRoles.indexOf(role) !== -1);
}

export function formatPrice(price) {
	if (!price && price !== 0) {
		return '';
	}

	price = String(price);

	return price.replace(/\d+/gi, match => {
		return formatThousands(match);
	});
}

export function getUrl(url) {
	return ENV.urls[url];
}

export function processErrors(errors) {
	process(errors);
}

function process(errors) {
	if (_.isObject(errors)) {
		processObject(errors);
	} else if (_.isArray(errors)) {
		processArray(errors);
	} else if (_.isString(errors)) {
		processString(errors);
	}
}
function processObject(errors) {
	_.forEach(errors, process);
}
function processArray(errors) {
	_.forEach(errors, process);
}
function processString(error) {
	toastr.warning(error);
}
