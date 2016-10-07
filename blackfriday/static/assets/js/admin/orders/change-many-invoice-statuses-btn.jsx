/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {invoiceActions} from './invoice-list.jsx';

export default class ChangeManyInvoiceStatusesBtn extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			disabled: props.disabled
		};

		this.handleClick = this.handleClick.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		this.setState({
			disabled: nextProps.disabled
		});
	}

	handleClick() {
		if (this.state.disabled) {
			return;
		}

		this.requestIvoicesStatuses();
	}

	requestIvoicesStatuses() {
		this.setState({disabled: true});

		const {newStatus, invoiceIds} = this.props;
		const json = {
			ids: invoiceIds,
			status: newStatus
		};

		xhr({
			url: '/api/invoices/statuses/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp) => {
			this.setState({disabled: false});

			if (resp.statusCode === 200) {
				invoiceActions.allUnselected(true /* stop */);
				invoiceActions.statusChanged(invoiceIds, newStatus);
			} else {
				toastr.error('Не удалось изменить статусы счетов');
			}
		});
	}

	render() {
		const {disabled} = this.state;

		return (
			<button
				className="btn btn-default"
				type="button"
				disabled={disabled}
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
