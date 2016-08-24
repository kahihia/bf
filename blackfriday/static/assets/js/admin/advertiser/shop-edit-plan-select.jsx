/* global window, toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {hasRole, formatPrice} from '../utils.js';
import PlanOptionList from './plan-option-list.jsx';
import ShopPlanSelect from './shop-plan-select.jsx';

const ShopEditPlanSelect = React.createClass({
	propTypes: {
		shopId: React.PropTypes.any,
		invoiceStatus: React.PropTypes.string
	},

	getInitialState() {
		return {
			isCustomPlan: false,
			activePlan: null,
			availableOptions: [],
			sum: 0,
			plans: [],
			options: []
		};
	},

	componentDidMount() {
		xhr({
			url: '/admin/promos',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				data = data || {};
				const plans = data.promos;
				const options = data.options;

				if (this.props.invoiceStatus === 'canceled') {
					this.processData({plans, options});
				} else {
					this.requestCurrentPlan({plans, options});
				}
			} else {
				toastr.error('Не удалось получить список тарифов');
			}
		});
	},

	requestCurrentPlan({plans = [], options = []}) {
		xhr({
			url: `/admin/merchant/${this.props.shopId}/promo`,
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.processData({plans, options, data});
			} else {
				toastr.error('Не удалось получить данные тарифного плана');
			}
		});
	},

	processData({plans, options, data}) {
		data = data || {
			id: plans[0].id,
			options: []
		};

		let priceOld = 0;
		if (data.price) {
			priceOld += data.price;
		}

		const activePlanId = data.id;
		let currentPlan = _.find(plans, {id: activePlanId});
		const isCustomPlan = !currentPlan;

		if (isCustomPlan) {
			currentPlan = data;
			plans.push(currentPlan);
		} else {
			const currentPlanPrice = currentPlan.price;
			// Disable plans with price < current plan price
			plans.forEach(plan => {
				if (plan.price < currentPlanPrice) {
					plan.disabled = true;
				}
			});

			currentPlan.options = data.options;
		}

		const availableOptions = this.collectAvailableOptions(options, currentPlan.options);
		// Collect active plan options
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

		// Activate active plan options in all plans and options
		activeOptions.forEach(option => {
			a(options, option);
			_.forEach(plans, plan => {
				if (!plan.options) {
					return;
				}
				a(plan.options, option);
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
			isCustomPlan: isCustomPlan,
			priceOld: priceOld,
			activePlan: activePlanId,
			plans: plans,
			options: options,
			availableOptions: availableOptions
		});
	},

	handleChangePlan(planId) {
		this.setState({
			activePlan: planId,
			availableOptions: this.getAvailableOptions(planId)
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

	getAvailableOptions(planId) {
		return this.collectAvailableOptions(this.state.options, this.getPlanOptions(planId));
	},

	collectAvailableOptions(options, planOptions) {
		const availableOptions = planOptions ? planOptions.concat(options) : options;
		const uniqAvailableOptions = _.uniqBy(availableOptions, 'id');
		// Move 'По запросу' bottom
		let sorted = _.sortBy(uniqAvailableOptions, 'name');
		sorted = _.sortBy(sorted, 'price');

		return sorted;
	},

	getPlanOptions(planId) {
		const plan = this.getPlanById(planId);

		return plan.options || [];
	},

	calculateSum() {
		const plan = this.getActivePlan();
		const activeOptions = this.getActiveOptions();

		let sum = 0;
		if (activeOptions.length) {
			sum += activeOptions.reduce((a, b) => {
				const value = b.value || 0;
				const price = b.price || 0;
				return a + (value * price);
			}, 0);
		}
		if (plan.price) {
			sum += plan.price;
		}

		if (this.state.priceOld) {
			sum -= this.state.priceOld;
		}

		return sum;
	},

	getActiveOptions() {
		return this.state.availableOptions.filter(o => o.isActive);
	},

	getActivePlan() {
		return this.getPlanById(this.state.activePlan);
	},

	getPlanById(planId) {
		return _.find(this.state.plans, {id: planId}) || {};
	},

	requestFinal() {
		const activeOptions = this.getActiveOptions();
		const requestOptions = activeOptions.reduce((a, b) => {
			const {id, value} = b;
			a.push({id, value});
			return a;
		}, []);

		xhr({
			url: `/admin/merchant/${this.props.shopId}/promo`,
			method: 'PUT',
			json: {
				name: this.state.name,
				url: this.state.url,
				promo_id: this.state.activePlan,
				options: requestOptions
			}
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				let pathname = '/admin/merchant/invoices';

				if (hasRole('admin')) {
					pathname = '/admin/invoice-list';
				}

				window.location.pathname = pathname;
			} else {
				toastr.error(data);
			}
		});
	},

	render() {
		return (
			<div>
				{this.state.plans.length && !this.state.isCustomPlan ? (
					<ShopPlanSelect
						plans={this.state.plans}
						activePlan={this.state.activePlan}
						onChangePlan={this.handleChangePlan}
						/>
				) : null}

				<h2>
					{'Дополнительные опции'}
				</h2>

				<PlanOptionList
					options={this.state.availableOptions}
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

export default ShopEditPlanSelect;
