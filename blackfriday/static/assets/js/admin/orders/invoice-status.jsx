/* eslint react/require-optimization: 0 */

import React from 'react';
import {PAYMENT_STATUS} from '../const.js';

export default class InvoiceStatus extends React.Component {
	render() {
		const {code} = this.props;

		let className = 'text-muted';
		if (code === 0) {
			className = 'text-danger';
		} else if (code === 1) {
			className = 'text-success';
		}

		return (
			<span className={className}>
				{PAYMENT_STATUS[code]}
			</span>
		);
	}
}
InvoiceStatus.propTypes = {
	code: React.PropTypes.number
};
