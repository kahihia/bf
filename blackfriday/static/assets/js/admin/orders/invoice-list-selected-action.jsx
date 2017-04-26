import React from 'react';
import {PAYMENT_STATUS} from '../const.js';
import ChangeManyInvoiceStatusesBtn from './change-many-invoice-statuses-btn.jsx';

class InvoiceListSelectedAction extends React.Component {
	constructor(props) {
		super(props);

		this.handleChangeNewStatus = this.handleChangeNewStatus.bind(this);
		this.handleClickChangeStatuses = this.handleClickChangeStatuses.bind(this);
	}

	handleChangeNewStatus(e) {
		this.props.onChangeNewStatus(e);
	}

	handleClickChangeStatuses(ids) {
		this.props.onClickChangeStatuses(ids);
	}

	render() {
		const {
			isLoading,
			newStatus,
			noSelectedItems,
			selectedItemsIds
		} = this.props;

		return (
			<div className="form-group">
				<div className="col-sm-2">
					<div className="form-control-static">
						{'Для выбранных'}
					</div>
				</div>

				<div className="col-sm-5">
					<select
						className="form-control"
						value={newStatus}
						disabled={noSelectedItems || isLoading}
						onChange={this.handleChangeNewStatus}
						>
						<option value={1}>
							{`Изменить статус на «${PAYMENT_STATUS[1]}»`}
						</option>

						<option value={0}>
							{`Изменить статус на «${PAYMENT_STATUS[0]}»`}
						</option>

						<option value={2}>
							{`Изменить статус на «${PAYMENT_STATUS[2]}»`}
						</option>
					</select>
				</div>

				<div className="col-sm-2">
					<ChangeManyInvoiceStatusesBtn
						invoiceIds={selectedItemsIds}
						disabled={noSelectedItems || isLoading}
						newStatus={newStatus}
						onClick={this.handleClickChangeStatuses}
						/>
				</div>

				<div className="col-sm-3 text-right">
					{isLoading ? (
						<div className="form-control-static text-muted">
							{'Загрузка...'}
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
InvoiceListSelectedAction.propTypes = {
	isLoading: React.PropTypes.bool,
	newStatus: React.PropTypes.number,
	noSelectedItems: React.PropTypes.bool,
	onChangeNewStatus: React.PropTypes.func.isRequired,
	onClickChangeStatuses: React.PropTypes.func.isRequired,
	selectedItemsIds: React.PropTypes.array
};
InvoiceListSelectedAction.defaultProps = {
};

export default InvoiceListSelectedAction;
