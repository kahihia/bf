import xhr from 'xhr';

let categories;

export default function getCategories(cb) {
	if (categories) {
		cb(categories);
		return;
	}

	requestCategories(cb);
}

function requestCategories(cb) {
	xhr({
		url: '/admin/categories',
		method: 'GET',
		json: true
	}, (err, resp, data) => {
		if (!err && resp.statusCode === 200) {
			if (data) {
				categories = data;
				cb(categories);
			}
		}
	});
}
