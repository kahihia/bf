export function getApplicationStatusColor(status, className) {
	let type = className || '';
	switch (status) {
		case 0: {
			type += 'info';
			break;
		}
		case 10: {
			type += 'warning';
			break;
		}
		case 20: {
			type += 'success';
			break;
		}
		case 30: {
			type += 'danger';
			break;
		}
		default: {
			break;
		}
	}

	return `${type}`;
}
