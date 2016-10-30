/* global window toastr _ */

import formatThousands from 'format-thousands';
import {SORT_TYPES} from './const.js';

export const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

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

export function getFullUrl(url) {
	return `${ENV.siteUrl}${ENV.urls[url]}`;
}

export function processErrors(errors) {
	process(errors);
}

function process(errors) {
	if (_.isArray(errors)) {
		processArray(errors);
	} else if (_.isObject(errors)) {
		processObject(errors);
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

export function reverseSortDirection(sortDir) {
	return sortDir === SORT_TYPES.DESC ? SORT_TYPES.ASC : SORT_TYPES.DESC;
}

export function isUTM(value) {
	const match = value.match(/utm_medium|utm_source|utm_campaign/g);

	if (match === null) {
		return false;
	}

	if (match.length === 3 && /\?/.test(value)) {
		return true;
	}

	return false;
}

export function getCssClassForModerationStatus(status) {
	switch (status) {
		case 1:
			return 'text-warning';
		case 2:
			return 'text-success';
		case 3:
			return 'text-danger';
		default:
			return 'text-muted';
	}
}
