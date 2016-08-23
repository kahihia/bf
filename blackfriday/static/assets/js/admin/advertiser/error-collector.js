/* global _ */

export default function errorCollector(errors, c = []) {
	let l = [];

	if (errors.rows) {
		l = l.concat(c);
		l = addRows(errors.rows, l);
	} else if (_.isObject(errors)) {
		_.forEach(errors, error => {
			l = addRows(errorCollector(error, c), l);
		});
	}

	return l.sort();
}

function addRows(rows, allRows) {
	const l = allRows.slice();

	rows.forEach(row => {
		if (l.indexOf(row) < 0) {
			l.push(row);
		}
	});

	return l;
}
