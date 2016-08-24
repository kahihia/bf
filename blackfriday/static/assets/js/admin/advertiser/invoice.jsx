/* global moment, toastr, saveAs, Blob */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import classNames from 'classnames';

import {formatPrice} from '../utils.js';

const Invoice = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		shopId: React.PropTypes.number,
		createdAt: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		expired: React.PropTypes.string,
		options: React.PropTypes.array,
		promo: React.PropTypes.object,
		status: React.PropTypes.string,
		statusName: React.PropTypes.string,
		sum: React.PropTypes.number,
		onCancel: React.PropTypes.func,
		onClickPay: React.PropTypes.func,
		active: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			promo: {}
		};
	},

	getInitialState() {
		return {};
	},

	handleCancel(e) {
		e.preventDefault();
		this.props.onCancel(this.props.id);
	},

	handleClickPay() {
		this.props.onClickPay(this.props.id, this.props.sum);
	},

	handleClickDownloadPayment(e) {
		e.preventDefault();
		this.requestDownloadPayment();
	},

	requestDownloadPayment() {
		xhr({
			url: `/admin/invoice/${this.props.id}/payment`,
			responseType: 'arraybuffer'
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				const d = moment(this.props.createdAt).format('D MMMM YYYY');
				const blob = new Blob([data], {type: 'application/pdf;charset=utf-8'});
				saveAs(blob, `Счёт №${this.props.id} на оплату от ${d}.pdf`);
			} else {
				toastr.error(data);
			}
		});
	},

	render() {
		const d = moment(this.props.createdAt).format('D MMMM YYYY');

		return (
			<div className={classNames('invoice-card', {'invoice-card_active': this.props.active})}>
				<Scroll.Element name={`anchor-invoice-${this.props.id}`}/>
				<div className="invoice-card__header">
					<span className="invoice-card__name">
						{`Счёт №${this.props.id} от ${d}`}
					</span>
					{this.props.statusName ? (
						<span className="invoice-card__status">
							{`(${this.props.statusName})`}
						</span>
					) : null}
					{this.props.status === 'waiting' ? (
						<a
							className="invoice-card__cancel"
							href="#"
							onClick={this.handleCancel}
							>
							{'Аннулировать'}
						</a>
					) : null}
					{this.props.status === 'waiting' ? (
						<button
							className="close"
							onClick={this.handleCancel}
							type="button"
							title="Аннулировать"
							>
							<span>×</span>
						</button>
					) : null}
				</div>

				<div className="invoice-card__content">
					<ul className="props">
						<li className="props__item">
							<span className="props__label">
								{'Магазин:'}
							</span>
							<span className="props__value">
								{this.props.name}
							</span>
						</li>
						{this.props.promo ? (
							<li className="props__item">
								<span className="props__label">
									{'Тарифный план:'}
								</span>
								<span className="props__value">
									{this.props.promo.name}
								</span>
								<Price
									cost={formatPrice(this.props.promo.price)}
									currency={'₽'}
									/>
							</li>
						) : null}
					</ul>

					{this.props.options.length ? (
						<ul className="option-list invoice-card__option-list">
							{this.props.options.map((option, key) => {
								return (
									<li
										key={key}
										className="option-list__item"
										>
										<span className="option-list__name">
											{option.name}
										</span>
										<Price
											cost={formatPrice(option.price)}
											currency={'₽'}
											/>
									</li>
								);
							})}
						</ul>
					) : null}
				</div>

				<div className="invoice-card__footer">
					{this.props.status === 'waiting' ? (
						<div className="invoice-card__help">
							{'Ваш пакет и доп. опции забронированны.'}
							<br/>
							<strong>
								{`Бронь действует до ${moment(this.props.expired).format('D MMMM YYYY')}. `}
							</strong>
							{'В случае не поступления средств по счёту бронь снимается и позиции возвращаются в продажу.'}
						</div>
					) : null}

					<div className="invoice-card__calc">
						<div className="invoice-card__sum">
							{'Итого: '}
							<Price
								cost={formatPrice(this.props.sum)}
								currency={'₽'}
								/>
						</div>
						{this.props.status === 'waiting' ? (
							<div className="invoice-card__process">
								<button
									className="btn btn-success"
									type="button"
									onClick={this.handleClickDownloadPayment}
									>
									{'Получить счёт'}
								</button>
								<button
									className="btn btn-primary"
									type="button"
									onClick={this.handleClickPay}
									>
									{'Оплатить картой'}
								</button>
							</div>
						) : null}
					</div>
				</div>
			</div>
		);
	}
});

export default Invoice;
