/* global window */

const LIMITS = JSON.parse(JSON.stringify(window.LIMITS));

export function getLimit(name) {
	if (!LIMITS[name]) {
		LIMITS[name] = 0;
	}

	return LIMITS[name];
}
