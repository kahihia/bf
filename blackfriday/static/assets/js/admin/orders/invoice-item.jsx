/* global moment */

import React from 'react';
import Price from 'react-price';
import DatePicker from 'react-datepicker';
import {formatPrice} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import InvoiceStatus from './invoice-status.jsx';

export default class InvoiceItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isEditingExpireDate: false
		};

		this.handleSelect = this.handleSelect.bind(this);
		this.handleChangeExpireDate = this.handleChangeExpireDate.bind(this);
		this.handleClickEditExpireDate = this.handleClickEditExpireDate.bind(this);
	}

	handleClickEditExpireDate(e) {
		e.preventDefault();
		this.setState({isEditingExpireDate: !this.state.isEditingExpireDate});
	}

	handleSelect() {
		this.props.onSelect(this.props.data.id);
	}

	handleChangeExpireDate(date) {
		this.props.onChangeExpireDate(this.props.data.id, date);
	}

	render() {
		const {isEditingExpireDate} = this.state;
		const {data, selected} = this.props;

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
					{data.promo ? data.promo.name : ''}
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
							selected={moment(data.expiredDate)}
							maxDate={moment(data.expiredDate).add(7, 'd')}
							minDate={moment(data.expiredDate)}
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
	selected: React.PropTypes.bool,
	onSelect: React.PropTypes.func.isRequired,
	onChangeExpireDate: React.PropTypes.func.isRequired
};
InvoiceItem.defaultProps = {
};
