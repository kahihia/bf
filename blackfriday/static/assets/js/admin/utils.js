/* global window */

import formatThousands from 'format-thousands';

const ENV = JSON.parse(JSON.stringify(window.ENV));

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
