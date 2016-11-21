import xhr from 'xhr';

const NAMES = [
	'merchant',
	'banner',
	'logo',
	'teaser'
];

const TYPES = [
	'shown',
	'clicked'
];

const trackers = {};

NAMES.forEach(name => {
	TYPES.forEach(type => {
		if (!trackers[name]) {
			trackers[name] = {};
		}
		trackers[name][type] = makeRequest(type, name);
	});
});

function makeRequest(type, name) {
	const action = [`${type}-${name}s`];

	return function () {
		var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
		const urlItems = Array.prototype.concat.call(action, Array.prototype.slice.call(args));
		const url = `/${urlItems.join('/')}/`;
		request(url);
	};
}

function request(url) {
	xhr(url, () => {});
}

export default trackers;
