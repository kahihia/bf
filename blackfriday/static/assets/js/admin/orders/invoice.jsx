/* global moment saveAs Blob toastr */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import b from 'b_';
import {PAYMENT_STATUS} from '../const.js';
import {formatPrice, processErrors} from '../utils.js';

const Invoice = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		merchant: React.PropTypes.object,
		createdDatetime: React.PropTypes.string,
		expiredDate: React.PropTypes.string,
		options: React.PropTypes.array,
		promo: React.PropTypes.object,
		status: React.PropTypes.number,
		sum: React.PropTypes.number,
		onCancel: React.PropTypes.func,
		onClickPay: React.PropTypes.func,
		active: React.PropTypes.bool
	},

	handleCancel(e) {
		e.preventDefault();
		this.props.onCancel(this.props.id);
	},

	handleClickPay() {
		this.props.onClickPay(this.props.id);
	},

	handleClickDownloadPayment(e) {
		e.preventDefault();
		this.requestDownloadPayment();
	},

	requestDownloadPayment() {
		xhr({
			url: `/api/invoices/${this.props.id}/receipt/`,
			method: 'GET',
			responseType: 'arraybuffer'
		}, (err, resp, data) => {
			const {statusCode} = resp;

			if (statusCode >= 200 && statusCode < 300) {
				const d = moment(this.props.createdDatetime).format('D MMMM YYYY');
				const blob = new Blob([data], {type: 'application/pdf;charset=utf-8'});
				saveAs(blob, `Счёт №${this.props.id} на оплату от ${d}.pdf`);
			} else if (statusCode === 400) {
				processErrors(data);
			} else {
				toastr.error('Не удалось получить файл счёта');
			}
		});
	},

	render() {
		const {
			active,
			createdDatetime,
			expiredDate,
			id,
			merchant,
			options,
			promo,
			status,
			sum
		} = this.props;

		const d = moment(createdDatetime).format('D MMMM YYYY');
		const className = 'invoice-card';

		return (
			<div className={b(className, {active: active})}>
				<Scroll.Element name={`anchor-invoice-${id}`}/>

				<div className={b(className, 'header')}>
					<span className={b(className, 'name')}>
						{`Счёт №${id} от ${d}`}
					</span>

					<span className={b(className, 'status')}>
						{`(${PAYMENT_STATUS[status]})`}
					</span>

					{status === 0 ? (
						<a
							className={b(className, 'cancel')}
							href="#"
							onClick={this.handleCancel}
							>
							{'Аннулировать'}
						</a>
					) : null}

					{status === 0 ? (
						<button
							className="close"
							onClick={this.handleCancel}
							type="button"
							title="Аннулировать"
							>
							<span>
								{'×'}
							</span>
						</button>
					) : null}
				</div>

				<div className={b(className, 'content')}>
					<ul className="props">
						<li className="props__item">
							<span className="props__label">
								{'Магазин:'}
							</span>

							<span className="props__value">
								{merchant.name}
							</span>
						</li>

						{promo ? (
							<li className="props__item">
								<span className="props__label">
									{'Рекламный пакет:'}
								</span>

								<span className="props__value">
									{promo.name}
								</span>

								<Price
									cost={formatPrice(promo.price)}
									currency={'₽'}
									/>
							</li>
						) : null}
					</ul>

					{options.length ? (
						<table className="table table-hover option-list invoice-card__option-list">
							<thead>
								<tr>
									<th className={b('option-list', 'th', {name: 'name'})}>
										{'Опции'}
									</th>

									<th className={b('option-list', 'th', {name: 'price'})}>
										{'Цена'}
									</th>

									<th className={b('option-list', 'th', {name: 'count'})}>
										{'Кол-во'}
									</th>

									<th className={b('option-list', 'th', {name: 'sum'})}>
										{'Стоимость'}
									</th>
								</tr>
							</thead>

							<tbody>
								{options.map((option, key) => {
									return (
										<tr key={key}>
											<td className={b('option-list', 'td', {name: 'name'})}>
												{option.name}
											</td>

											<td className={b('option-list', 'td', {name: 'price'})}>
												<Price
													cost={formatPrice(option.price)}
													currency={'₽'}
													/>
											</td>

											<td className={b('option-list', 'td', {name: 'count'})}>
												{option.value}
											</td>

											<td className={b('option-list', 'td', {name: 'sum'})}>
												<Price
													cost={formatPrice(option.price * option.value)}
													currency={'₽'}
													/>
											</td>
										</tr>
									);
								})}
							</tbody>
						</table>
					) : null}
				</div>

				<div className={b(className, 'footer')}>
					{status === 0 ? (
						<div className={b(className, 'help')}>
							{'Ваш пакет и доп. опции забронированны.'}
							<br/>
							<strong>
								{`Бронь действует до ${moment(expiredDate).format('D MMMM YYYY')}. `}
							</strong>
							{'В случае не поступления средств по счёту бронь снимается и позиции возвращаются в продажу.'}
						</div>
					) : null}

					<div className={b(className, 'calc')}>
						<div className={b(className, 'sum')}>
							{'Итого: '}
							<Price
								cost={formatPrice(sum)}
								currency={'₽'}
								/>
						</div>

						{status === 0 ? (
							<div className={b(className, 'process')}>
								<button
									className="btn btn-default"
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
