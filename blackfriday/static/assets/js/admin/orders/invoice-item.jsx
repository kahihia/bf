/* global moment */

import React from 'react';
import Price from 'react-price';
import DatePicker from 'react-datepicker';
import {formatPrice} from '../utils.js';
import {invoiceActions} from './invoice-list.jsx';
import {InvoiceStatus} from './invoice-status.jsx';

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
			const newData = Object.assign({}, this.state.data, {status: newStatus});

			this.setState({
				data: newData
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
					<input type="checkbox" checked={selected} onChange={this.handleSelect}/>
				</td>
				<td>
					{moment(data.created_at).format('DD.MM.YYYY')}
				</td>
				<td>
					{data.advertiser_name || ''}
				</td>
				<td>
					{data.merchant_name || ''}
				</td>
				<td>
					{data.invoice || ''}
				</td>
				<td>
					{data.promo_name || ''}
				</td>
				<td>
					<ul>
						{data.options.map((option, index) => {
							return (
								<li key={index}>
									{option.name}
								</li>
							);
						})}
					</ul>
				</td>
				<td>
					<Price cost={formatPrice(data.sum)} currency={'₽'}/>
				</td>
				<td className="text-nowrap">
					{data.status === 'waiting' ? (
						<a
							href="#"
							onClick={this.handleClickEditExpireDate}
							style={{marginRight: 4}}
							>
							<span className="glyphicon glyphicon-time"/>
						</a>
					) : null}

					<InvoiceStatus code={data.status}/>

					{isEditingExpireDate ? (
						<DatePicker
							className="form-control datepicker-input-sm"
							style={{fontSize: 14}}
							dateFormat="DD/MM"
							selected={moment(data.expired)}
							maxDate={moment(data.expired).add(7, 'd')}
							minDate={moment(data.expired)}
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
