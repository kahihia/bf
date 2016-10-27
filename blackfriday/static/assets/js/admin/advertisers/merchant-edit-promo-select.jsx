/* global window toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {TOKEN} from '../const.js';
import {formatPrice, processErrors, getUrl} from '../utils.js';
import PromoOptionList from './promo-option-list.jsx';
import MerchantPromoSelect from './merchant-promo-select.jsx';

const MerchantEditPromoSelect = React.createClass({
	propTypes: {
		activePromoId: React.PropTypes.number,
		merchantId: React.PropTypes.number,
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
			url: '/api/promos/?is_custom=false',
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
			url: '/api/options/?is_required=0',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					let sorted = _.sortBy(data, 'name');
					sorted = _.sortBy(sorted, 'price');
					sorted.forEach(item => {
						item.promosAvailableFor = item.promosAvailableFor.map(i => i.id);
					});
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
		const isNew = this.props.activePromoId === null;
		const activePromoId = isNew ? promos[0].id : this.props.activePromoId;
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
			if (!isNew) {
				priceOld = currentPromoPrice;
			}
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

	getAvailableOptionById(id) {
		return _.find(this.state.availableOptions, {id});
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
		return this.getAvailableOptions().filter(o => o.isActive);
	},

	getActivePromo() {
		return this.getPromoById(this.state.activePromoId);
	},

	getPromoById(id) {
		return _.find(this.state.promos, {id}) || {};
	},

	requestFinal() {
		let activeOptions = this.getActiveOptions();
		activeOptions = activeOptions.reduce((a, b) => {
			const {id, value, price} = b;
			a.push({id, value, price});
			return a;
		}, []);

		let isValid = false;

		const {activePromoId} = this.state;
		const json = {merchantId: this.props.merchantId};

		if (activePromoId !== this.props.activePromoId) {
			json.promoId = activePromoId;
			isValid = true;
		}

		if (activeOptions.length) {
			json.options = activeOptions;
			isValid = true;
		}

		if (!isValid) {
			return;
		}

		xhr({
			url: '/api/invoices/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 201: {
					window.location = `${getUrl('invoices')}#invoice${data.id}`;
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось выставить счёт');
					break;
				}
			}
		});
	},

	getAvailableOptions() {
		const {
			activePromoId,
			availableOptions
		} = this.state;

		const availableOptionsFiltered = _.filter(availableOptions, option => {
			return option.promosAvailableFor.indexOf(activePromoId) > -1;
		});

		return availableOptionsFiltered;
	},

	render() {
		const {
			activePromoId,
			isCustomPromo,
			promos
		} = this.state;

		const availableOptions = this.getAvailableOptions();

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

				{availableOptions.length ? (
					<div>
						<h2>
							{'Дополнительные опции'}
						</h2>

						<PromoOptionList
							options={availableOptions}
							onChange={this.handleChangeOption}
							onCheck={this.handleCheckOption}
							/>
					</div>
				) : null}

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
