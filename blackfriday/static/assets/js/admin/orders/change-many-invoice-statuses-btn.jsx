/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
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
		const {disabled, invoiceIds} = this.state;
		const {newStatus} = this.props;

		if (!disabled) {
			const json = {
				ids: invoiceIds,
				status: newStatus
			};

			this.setState({
				disabled: true
			}, () => {
				xhr({
					url: '/api/invoices/statuses/',
					method: 'PATCH',
					headers: {
						'X-CSRFToken': TOKEN.csrftoken
					},
					json
				}, (err, resp) => {
					this.setState({
						disabled: false
					}, () => {
						if (!err && (resp.statusCode === 200)) {
							invoiceActions.allUnselected(true /* stop */);
							invoiceActions.statusChanged(invoiceIds, newStatus);
						} else {
							toastr.error('Не удалось изменить статусы счетов');
						}
					});
				});
			});
		}
	}

	render() {
		return (
			<button
				className="btn btn-default"
				type="button"
				disabled={this.state.disabled}
				onClick={this.handleClick}
				>
				{'Применить'}
			</button>
		);
	}
}
ChangeManyInvoiceStatusesBtn.propTypes = {
	invoiceIds: React.PropTypes.array,
	disabled: React.PropTypes.bool,
	newStatus: React.PropTypes.number
};
ChangeManyInvoiceStatusesBtn.defaultProps = {
	disabled: false
};
