/* global moment toastr saveAs Blob */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import Scroll from 'react-scroll';
import b from 'b_';
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
		const {
			active,
			createdAt,
			expired,
			id,
			name,
			options,
			promo,
			status,
			statusName,
			sum
		} = this.props;

		const d = moment(createdAt).format('D MMMM YYYY');
		const className = 'invoice-card';

		return (
			<div className={b(className, {active: active})}>
				<Scroll.Element name={`anchor-invoice-${id}`}/>

				<div className={b(className, 'header')}>
					<span className={b(className, 'name')}>
						{`Счёт №${id} от ${d}`}
					</span>

					{statusName ? (
						<span className={b(className, 'status')}>
							{`(${statusName})`}
						</span>
					) : null}

					{status === 'waiting' ? (
						<a
							className={b(className, 'cancel')}
							href="#"
							onClick={this.handleCancel}
							>
							{'Аннулировать'}
						</a>
					) : null}

					{status === 'waiting' ? (
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
								{name}
							</span>
						</li>

						{promo ? (
							<li className="props__item">
								<span className="props__label">
									{'Тарифный план:'}
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
						<ul className="option-list invoice-card__option-list">
							{options.map((option, key) => {
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

				<div className={b(className, 'footer')}>
					{status === 'waiting' ? (
						<div className={b(className, 'help')}>
							{'Ваш пакет и доп. опции забронированны.'}
							<br/>
							<strong>
								{`Бронь действует до ${moment(expired).format('D MMMM YYYY')}. `}
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

						{status === 'waiting' ? (
							<div className={b(className, 'process')}>
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
