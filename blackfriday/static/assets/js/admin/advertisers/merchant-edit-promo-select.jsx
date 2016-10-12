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
					const promos = data;
					this.requestOptions(promos);
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

	requestOptions(promos) {
		xhr({
			url: `/api/merchants/${this.props.id}/available-options/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					const options = data;
					this.processData({promos, options});
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

	processData({promos, options}) {
		const data = {
			id: promos[0].id || this.props.activePromoId,
			options: []
		};

		let priceOld = 0;
		if (data.price) {
			priceOld += data.price;
		}

		const activePromoId = data.id;
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

			currentPromo.options = data.options;
		}

		const availableOptions = this.collectAvailableOptions(options, currentPromo.options);
		// Collect active promo options
		const activeOptions = [];
		availableOptions.forEach(option => {
			if (option.price && option.value) {
				activeOptions.push({
					id: option.id,
					value: option.value
				});
				priceOld += (option.price * option.value);
			}
		});

		// Activate active promo options in all promos and options
		activeOptions.forEach(option => {
			a(options, option);
			_.forEach(promos, promo => {
				if (!promo.options) {
					return;
				}
				a(promo.options, option);
			});
		});

		// Activate option in options
		function a(options, option) {
			const o = _.find(options, {id: option.id});
			if (!o) {
				return;
			}
			o.isActive = true;
			o.required = true;
			o.value = option.value;
			o.minValue = option.value;
		}

		this.setState({
			activePromoId,
			isCustomPromo,
			priceOld,
			promos,
			options,
			availableOptions
		});
	},

	handleChangePromo(promoId) {
		this.setState({
			activePromoId: promoId,
			availableOptions: this.getAvailableOptions(promoId)
		});
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

	getAvailableOptions(promoId) {
		return this.collectAvailableOptions(this.state.options, this.getPromoOptions(promoId));
	},

	collectAvailableOptions(options, promoOptions) {
		const availableOptions = promoOptions ? promoOptions.concat(options) : options;
		const uniqAvailableOptions = _.uniqBy(availableOptions, 'id');
		// Move 'По запросу' bottom
		let sorted = _.sortBy(uniqAvailableOptions, 'name');
		sorted = _.sortBy(sorted, 'price');

		return sorted;
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
