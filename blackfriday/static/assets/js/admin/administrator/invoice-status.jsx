/* global React */
/* eslint "react/require-optimization": "off" */

export const invoiceStatuses = {
	waiting: 'Не оплачен',
	paid: 'Оплачен',
	canceled: 'Отменён'
};

export class InvoiceStatus extends React.Component {
	constructor(props) {
		let statusClass;

		super(props);

		switch (props.code) {
			case 'waiting':
				statusClass = 'text-danger';
				break;
			case 'paid':
				statusClass = 'text-success';
				break;
			case 'canceled':
			default:
				statusClass = 'text-muted';
				break;
		}
		this.state = {
			statusClass: statusClass
		};
	}

	render() {
		return (
			<span className={this.state.statusClass}>{invoiceStatuses[this.props.code]}</span>
		);
	}
}

InvoiceStatus.propTypes = {
	code: React.PropTypes.string
};
