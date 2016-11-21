import Cookie from 'js-cookie';
import xhr from 'xhr';

const ACTION_NAMES = [
	'merchant',
	'banner',
	'logo',
	'teaser'
];

const ACTION_TYPES = [
	'shown',
	'clicked'
];

const WITH_CLIENT_ID = [
	'merchant'
];

const trackers = {};

ACTION_NAMES.forEach(name => {
	ACTION_TYPES.forEach(type => {
		if (!trackers[name]) {
			trackers[name] = {};
		}
		trackers[name][type] = makeRequest(type, name);
	});
});

function makeRequest(type, name) {
	const action = [`${type}-${name}s`];
	const withClientId = WITH_CLIENT_ID.indexOf(name) > -1;

	return function () {
		var args = (arguments.length === 1 ? [arguments[0]] : Array.apply(null, arguments));
		const urlItems = action.concat(args.slice());
		if (withClientId) {
			const clientId = getClientId();
			if (!clientId) {
				console.log('Client ID is empty');
				return;
			}
			urlItems.push(clientId);
		}

		const url = `/${urlItems.join('/')}/`;

		// Single shown request
		if (type === 'shown') {
			if (!this.showed) {
				this.showed = [];
			}
			if (this.showed.indexOf(url) > -1) {
				return;
			}
			this.showed.push(url);
		}

		request(url);
	};
}

function request(url) {
	xhr(url, () => {});
}

function getClientId() {
	return Cookie.get('rrpusid') || null;
}

export default trackers;
