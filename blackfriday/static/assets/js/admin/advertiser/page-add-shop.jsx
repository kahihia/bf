/* global window, toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import ControlLabel from '../components/control-label.jsx';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';
import Select from '../components/select.jsx';
import {hasRole, formatPrice} from '../utils.js';
import PlanOptionList from '../advertisers/promo-option-list.jsx';
import ShopPlanSelect from '../advertisers/merchant-promo-select.jsx';

const PageAddShop = React.createClass({
	getInitialState() {
		return {
			shopId: null,
			jurId: null,
			availableJur: [],
			name: '',
			url: '',
			activePlan: null,
			availableOptions: [],
			sum: 0,
			plans: [],
			options: [],
			isFirstStepComplete: false
		};
	},

	componentDidMount() {
		if (hasRole('admin')) {
			this.requestAdvertisers();
		}

		this.requestPromos();
	},

	requestAdvertisers() {
		xhr({
			url: '/admin/advertisers',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				const firstJur = data[0];
				let jurId = null;

				if (firstJur) {
					jurId = firstJur.id;
				}

				this.setState({
					jurId: jurId,
					availableJur: data
				});
			// } else {
			//	 console.log('Undefined page')
			}
		});
	},

	requestPromos() {
		xhr({
			url: '/admin/promos',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				const plans = data.promos;
				const options = data.options;

				const activePlan = plans[0].id;
				const availableOptions = () => {
					const plan = _.find(plans, {id: activePlan}) || {options: []};
					return options.concat(plan.options);
				};

				this.setState({
					plans: plans,
					options: options,
					activePlan: activePlan,
					availableOptions: availableOptions()
				});
			// } else {
			//	 console.log('Undefined page')
			}
		});
	},

	handleChangeJur(value) {
		this.setState({jurId: value});
	},

	handleChangeName(e) {
		this.setState({name: e.target.value});
	},

	handleChangeUrl(e) {
		this.setState({url: e.target.value});
	},

	handleKeyUpName(e) {
		if (e.key !== 'Enter') {
			return;
		}

		this.completeFirstStep();
	},

	handleKeyUpUrl(e) {
		if (e.key !== 'Enter') {
			return;
		}

		this.completeFirstStep();
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
		if (!this.validateFirstStep()) {
			return;
		}

		this.requestFinal();
	},

	validateFirstStep() {
		if (!this.state.name.trim()) {
			toastr.warning('Заполните поле "Название"');

			return false;
		}

		if (hasRole('admin') && this.state.jurId === null) {
			toastr.warning('Выберите "Юридическое лицо"');

			return false;
		}

		return true;
	},

	handleClickCompleteFirstStep() {
		this.completeFirstStep();
	},

	completeFirstStep() {
		if (!this.validateFirstStep()) {
			return;
		}

		this.requestCompleteFirstStep();
	},

	getAvailableOptions(planId) {
		return this.collectAvailableOptions(this.state.options, this.getPlanOptions(planId));
	},

	collectAvailableOptions(options, planOptions) {
		const availableOptions = planOptions ? options.concat(planOptions) : options;
		// Move 'По запросу' bottom
		let sorted = _.sortBy(availableOptions, 'name');
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
		const requestData = {
			name: this.state.name,
			url: this.state.url,
			promo_id: this.state.activePlan,
			options: this.getActiveOptions()
		};

		if (hasRole('admin')) {
			requestData.user_id = this.state.jurId;
		}

		xhr({
			url: `/admin/merchant/${this.state.shopId}/promo`,
			method: 'PUT',
			json: requestData
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

	requestCompleteFirstStep() {
		const requestData = {
			name: this.state.name,
			url: this.state.url
		};

		if (hasRole('admin')) {
			requestData.user_id = this.state.jurId;
		}

		xhr({
			url: '/admin/merchant',
			method: 'POST',
			json: requestData
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				toastr.success(`Магазин ${this.state.name} успешно добавлен`);
				this.setState({
					shopId: String(data),
					isFirstStepComplete: true
				});
			} else {
				toastr.error(data);
			}
		});
	},

	getActivePlanOptions() {
		return this.getPlanOptions(this.state.activePlan);
	},

	render() {
		return (
			<div>
				<div className="add-shop-info">
					<h2>
						{'Информация'}
					</h2>

					<div className="form-horizontal">
						{hasRole('admin') ? (
							<label className="form-group">
								<ControlLabel
									name={'Юридическоe лицо'}
									className="col-sm-2"
									required
									/>
								<div className="col-sm-10">
									<Select
										options={this.state.availableJur}
										selected={this.state.jurId}
										onChange={this.handleChangeJur}
										/>
								</div>
							</label>
						) : null}

						<FormHorizontalRow
							label={'Название'}
							value={this.state.name}
							onChange={this.handleChangeName}
							onKeyUp={this.handleKeyUpName}
							required
							/>

						<FormHorizontalRow
							label={'URL'}
							value={this.state.url}
							type={'url'}
							onChange={this.handleChangeUrl}
							onKeyUp={this.handleKeyUpUrl}
							/>

						{this.state.isFirstStepComplete ? null : (
							<div className="text-right">
								<button
									type="button"
									className="btn btn-success"
									onClick={this.handleClickCompleteFirstStep}
									>
									{'Выбрать Рекламный Пакет'}
								</button>
							</div>
						)}
					</div>
				</div>

				<div className={(this.state.isFirstStepComplete ? 'fade in' : 'fade invisible')}>
					<ShopPlanSelect
						plans={this.state.plans}
						activePlan={this.state.activePlan}
						onChangePlan={this.handleChangePlan}
						/>

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
							<p>
								<strong>
									{'Чтобы добавить промо-материалы, необходимо выставить счет.'}
								</strong>
							</p>
							<p>
								{'После оплаты вы будете перенаправлены обратно в данный раздел для загрузки материалов.'}
							</p>
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
			</div>
		);
	}
});

export default PageAddShop;
