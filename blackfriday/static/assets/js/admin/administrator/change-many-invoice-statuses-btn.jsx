/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {invoiceActions} from './invoice-list.jsx';

export default class ChangeManyInvoiceStatusesBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			invoiceIds: props.invoiceIds,
			disabled: props.disabled
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			disabled: nextProps.disabled,
			invoiceIds: nextProps.invoiceIds
		});
	}

	handleClick() {
		let self = this;

		if (!self.state.disabled) {
			const data = self.state.invoiceIds.map(invoiceId => {
				return {
					id: invoiceId,
					status: self.props.newStatus
				};
			});

			self.setState({
				disabled: true
			}, function () {
				xhr.put('/admin/invoices', {json: data}, function (err, resp) {
					self.setState({
						disabled: false
					}, function () {
						if (!err && (resp.statusCode === 200)) {
							toastr.success('Статусы счетов изменены.');
							invoiceActions.allUnselected(true /* stop */);
							invoiceActions.statusChanged(self.state.invoiceIds, self.props.newStatus);
						} else {
							toastr.error('Не удалось изменить статусы счетов.');
						}
					});
				});
			});
		}
	}

	render() {
		return (
			<button
				className="btn btn-default" type="button"
				disabled={this.state.disabled}
				onClick={this.handleClick}
				>
				Применить
			</button>
		);
	}
}

ChangeManyInvoiceStatusesBtn.propTypes = {
	invoiceIds: React.PropTypes.array,
	disabled: React.PropTypes.bool,
	newStatus: React.PropTypes.string
};

ChangeManyInvoiceStatusesBtn.defaultProps = {
	disabled: false
};
