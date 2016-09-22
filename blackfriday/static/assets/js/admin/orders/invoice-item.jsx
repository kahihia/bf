/* global moment */

import React from 'react';
import Price from 'react-price';
import DatePicker from 'react-datepicker';
import {formatPrice} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import {invoiceActions} from './invoice-list.jsx';
import InvoiceStatus from './invoice-status.jsx';

export default class InvoiceItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			selected: props.selected,
			isEditingExpireDate: false
		};

		this.handleSelect = this.handleSelect.bind(this);
		this.onAllSelected = this.onAllSelected.bind(this);
		this.onAllUnselected = this.onAllUnselected.bind(this);
		this.onStatusChanged = this.onStatusChanged.bind(this);
		this.handleClickEditExpireDate = this.handleClickEditExpireDate.bind(this);
		this.handleChangeExpireDate = this.handleChangeExpireDate.bind(this);

		invoiceActions.onAllSelected(this.onAllSelected);
		invoiceActions.onAllUnselected(this.onAllUnselected);
		invoiceActions.onStatusChanged(actionData => {
			this.onStatusChanged(actionData.invoiceIds, actionData.newStatus);
		});
	}

	onAllSelected() {
		this.setState({selected: true});
	}

	onAllUnselected() {
		this.setState({selected: false});
	}

	onStatusChanged(invoiceIds, newStatus) {
		if (invoiceIds.indexOf(this.state.data.id) >= 0) {
			this.setState(previousState => {
				previousState.data.status = newStatus;
				return previousState;
			});
		}
	}

	handleSelect() {
		this.setState({
			selected: !this.state.selected
		}, () => {
			if (this.state.selected) {
				invoiceActions.itemSelected(this.state.data.id);
			} else {
				invoiceActions.itemUnselected(this.state.data.id);
			}
		});
	}

	handleClickEditExpireDate(e) {
		e.preventDefault();
		this.setState({isEditingExpireDate: !this.state.isEditingExpireDate});
	}

	handleChangeExpireDate(date) {
		invoiceActions.itemExpireDateChanged(this.state.data.id, date);
	}

	render() {
		const {selected, data, isEditingExpireDate} = this.state;

		return (
			<tr className={selected ? 'active' : ''}>
				<td>
					<input
						type="checkbox"
						checked={selected}
						onChange={this.handleSelect}
						/>
				</td>
				<td>
					{moment(data.createdDatetime).format('DD.MM.YYYY')}
				</td>
				<td>
					{data.advertiser.name || ''}
				</td>
				<td>
					{data.merchant.name || ''}
				</td>
				<td>
					{data.id || ''}
				</td>
				<td>
					{data.promo.name || ''}
				</td>
				<td>
					<ul>
						{data.options.map(option => {
							return (
								<li key={option.id}>
									{option.name}
								</li>
							);
						})}
					</ul>
				</td>
				<td>
					<Price
						cost={formatPrice(data.sum)}
						currency={'₽'}
						/>
				</td>
				<td>
					<div className="text-nowrap">
						{data.status === 0 ? (
							<a
								href="#"
								onClick={this.handleClickEditExpireDate}
								style={{marginRight: 4}}
								>
								<Glyphicon name="time"/>
							</a>
						) : null}

						<InvoiceStatus code={data.status}/>
					</div>

					{isEditingExpireDate ? (
						<DatePicker
							className="form-control datepicker-input-sm"
							style={{fontSize: 14}}
							dateFormat="DD/MM"
							selected={moment(data.expiredDatetime)}
							maxDate={moment(data.expiredDatetime).add(7, 'd')}
							minDate={moment(data.expiredDatetime)}
							locale="ru-ru"
							todayButton="Сегодня"
							onChange={this.handleChangeExpireDate}
							/>
					) : null}
				</td>
			</tr>
		);
	}
}
InvoiceItem.propTypes = {
	data: React.PropTypes.object,
	selected: React.PropTypes.bool
};
InvoiceItem.defaultProps = {
	selected: false
};
