/* global window toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {hasRole, formatPrice, processErrors} from '../utils.js';
import PromoOptionList from './promo-option-list.jsx';
import MerchantPromoSelect from './merchant-promo-select.jsx';

const MerchantEditPromoSelect = React.createClass({
	propTypes: {
		activePromoId: React.PropTypes.number,
		id: React.PropTypes.number,
		paymentStatus: React.PropTypes.number
	},

	getInitialState() {
		return {
			activePromoId: null,
			availableOptions: [],
			isCustomPromo: false,
			options: [],
			promos: [],
			sum: 0
		};
	},

	componentDidMount() {
		this.requestPromos();
	},

	requestPromos() {
		xhr({
			url: '/api/promos/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					this.processPromos(data);
					this.requestOptions();
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось получить список рекламных пакетов');
					break;
				}
			}
		});
	},

	requestOptions() {
		xhr({
			url: `/api/merchants/${this.props.id}/available-options/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					let sorted = _.sortBy(data, 'name');
					sorted = _.sortBy(sorted, 'price');
					this.setState({availableOptions: sorted});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось получить список опций рекламных пакетов');
					break;
				}
			}
		});
	},

	processPromos(promos) {
		const activePromoId = this.props.activePromoId || promos[0].id;
		const data = {
			id: activePromoId,
			options: []
		};

		let priceOld = 0;
		let currentPromo = _.find(promos, {id: activePromoId});
		const isCustomPromo = !currentPromo;

		if (isCustomPromo) {
			currentPromo = data;
			promos.push(currentPromo);
		} else {
			const currentPromoPrice = currentPromo.price;
			// Disable promos with price < current promo price
			promos.forEach(promo => {
				if (promo.price < currentPromoPrice) {
					promo.disabled = true;
				}
			});
		}

		this.setState({
			activePromoId,
			isCustomPromo,
			priceOld,
			promos
		});
	},

	handleChangePromo(activePromoId) {
		this.setState({activePromoId});
	},

	handleChangeOption(optionId, value) {
		const option = this.getAvailableOptionById(optionId);
		option.value = value;
		if (value > 0) {
			option.isActive = true;
		} else {
			option.isActive = false;
		}

		this.forceUpdate();
	},

	handleCheckOption(optionId, isChecked) {
		const option = this.getAvailableOptionById(optionId);
		option.isActive = isChecked;

		if (isChecked && !option.value) {
			option.value = 1;
		}

		this.forceUpdate();
	},

	getAvailableOptionById(optionId) {
		return _.find(this.state.availableOptions, {id: optionId});
	},

	handleClickFinal() {
		this.requestFinal();
	},

	getPromoOptions(promoId) {
		const promo = this.getPromoById(promoId);

		return promo.options || [];
	},

	calculateSum() {
		const promo = this.getActivePromo();
		const activeOptions = this.getActiveOptions();

		let sum = 0;
		if (activeOptions.length) {
			sum += activeOptions.reduce((a, b) => {
				const value = b.value || 0;
				const price = b.price || 0;
				return a + (value * price);
			}, 0);
		}
		if (promo.price) {
			sum += promo.price;
		}

		if (this.state.priceOld) {
			sum -= this.state.priceOld;
		}

		return sum;
	},

	getActiveOptions() {
		return this.state.availableOptions.filter(o => o.isActive);
	},

	getActivePromo() {
		return this.getPromoById(this.state.activePromoId);
	},

	getPromoById(id) {
		return _.find(this.state.promos, {id}) || {};
	},

	requestFinal() {
		const activeOptions = this.getActiveOptions();
		const requestOptions = activeOptions.reduce((a, b) => {
			const {id, value} = b;
			a.push({id, value});
			return a;
		}, []);

		xhr({
			url: `/admin/merchant/${this.props.id}/promo`,
			method: 'PUT',
			json: {
				name: this.state.name,
				url: this.state.url,
				promo_id: this.state.activePromoId,
				options: requestOptions
			}
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					let pathname = '/admin/merchant/invoices';

					if (hasRole('admin')) {
						pathname = '/admin/invoice-list';
					}

					window.location.pathname = pathname;
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error(data);
					break;
				}
			}
		});
	},

	render() {
		const {
			activePromoId,
			isCustomPromo,
			promos,
			availableOptions
		} = this.state;

		return (
			<div>
				{promos.length && !isCustomPromo ? (
					<MerchantPromoSelect
						{...{
							activePromoId,
							promos
						}}
						onChangePromo={this.handleChangePromo}
						/>
				) : null}

				<h2>
					{'Дополнительные опции'}
				</h2>

				<PromoOptionList
					options={availableOptions}
					onChange={this.handleChangeOption}
					onCheck={this.handleCheckOption}
					/>

				<div className="add-shop-footer">
					<div className="add-shop-footer__help">
						<p/>
					</div>

					<div className="add-shop-footer__calc">
						<div className="add-shop-footer__label">
							{'Итоговая сумма:'}
						</div>

						<div className="add-shop-footer__price">
							<Price
								cost={formatPrice(this.calculateSum())}
								currency={'₽'}
								/>
						</div>

						<button
							className="btn btn-primary"
							type="button"
							onClick={this.handleClickFinal}
							>
							{'Выставить счёт'}
						</button>
					</div>
				</div>
			</div>
		);
	}
});

export default MerchantEditPromoSelect;
