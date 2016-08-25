/* global window, toastr, _ */
/* eslint max-nested-callbacks: 0 */
/* eslint no-useless-escape: 0 */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {formatPrice} from '../utils.js';
import PreDefinedPromoTable from './pre-defined-promo-table.jsx';
import PromoActions from './promo-actions.js';
import PromoOption from './promo-option.jsx';

export const promoActions = new PromoActions();

export class PromoMaker extends React.Component {
	constructor() {
		super();
		this.state = {
			newPromo: {
				options: []
			},
			preDefinedPromos: [],
			regularOptions: [],
			extraOptions: [],
			merchants: [],
			total: 0,
			isLoading: true,
			loadingError: false
		};

		this.updateTotal = this.updateTotal.bind(this);
		this.handleChangeMerchant = this.handleChangeMerchant.bind(this);
		this.handleChangePrice = this.handleChangePrice.bind(this);
		this.handleChangeDiscount = this.handleChangeDiscount.bind(this);
		this.handleChangeName = this.handleChangeName.bind(this);
		this.handleSubmit = this.handleSubmit.bind(this);
		this.validate = this.validate.bind(this);

		this.onOptionIncluded = this.onOptionIncluded.bind(this);
		this.onOptionExcluded = this.onOptionExcluded.bind(this);
		this.onOptionChanged = this.onOptionChanged.bind(this);

		promoActions.onOptionIncluded(actionData => {
			this.onOptionIncluded(actionData.option);
		});

		promoActions.onOptionExcluded(actionData => {
			this.onOptionExcluded(actionData.option);
		});

		promoActions.onOptionChanged(actionData => {
			this.onOptionChanged(actionData.option);
		});
	}

	onOptionExcluded(option, callback) {
		callback = callback || this.updateTotal;

		const optionList = _.reject(this.state.newPromo.options, {id: option.id});

		this.setState({
			newPromo: Object.assign({}, this.state.newPromo, {options: optionList})
		}, callback);
	}

	onOptionIncluded(option) {
		const optionExists = _.findIndex(
			_.unionBy(this.state.regularOptions, this.state.extraOptions, 'id'),
			{id: option.id}
		) >= 0;

		this.onOptionExcluded(option, () => {
			if (optionExists) {
				const optionList = _.unionBy(this.state.newPromo.options, [option], 'id');

				this.setState({
					newPromo: Object.assign({}, this.state.newPromo, {options: optionList})
				}, this.updateTotal);
			}
		});
	}

	onOptionChanged(option) {
		let optionIndex = _.findIndex(
			this.state.newPromo.options,
			{id: option.id}
		);

		if (optionIndex >= 0) {
			let optionList = _.clone(this.state.newPromo.options);

			optionList[optionIndex] = option;

			this.setState({
				newPromo: Object.assign({}, this.state.newPromo, {options: optionList})
			}, this.updateTotal);
		}
	}

	componentDidMount() {
		xhr.get('/promo/?custom=0&details=1', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({
					preDefinedPromos: data
				}, () => {
					xhr.get('/promo/options?required=1', {json: true}, (err, resp, data) => {
						if (!err && resp.statusCode === 200) {
							this.setState({
								regularOptions: data
							}, () => {
								xhr.get('/promo/options?required=0', {json: true}, (err, resp, data) => {
									if (!err && resp.statusCode === 200) {
										this.setState({
											extraOptions: data
										}, () => {
											xhr.get('/admin/merchants', {json: true}, (err, resp, data) => {
												if (!err && resp.statusCode === 200) {
													this.setState({
														merchants: data,
														newPromo: Object.assign({}, this.state.newPromo, {
															merchant_id: _.get(_.first(data), 'id', null)
														}),
														isLoading: false
													});
												} else {
													this.setState({
														isLoading: false,
														loadingError: true
													}, () => {
														toastr.error('Не удалось получить список магазинов.');
													});
												}
											});
										});
									} else {
										this.setState({
											isLoading: false,
											loadingError: true
										}, () => {
											toastr.error('Не удалось получить список дополнительных опций.');
										});
									}
								});
							});
						} else {
							this.setState({
								isLoading: false,
								loadingError: true
							}, () => {
								toastr.error('Не удалось получить список стандартных опций.');
							});
						}
					});
				});
			} else {
				this.setState({
					isLoading: false,
					loadingError: true
				}, () => {
					toastr.error('Не удалось получить информацию о рекламных пакетах.');
				});
			}
		});
	}

	updateTotal() {
		const price = this.state.newPromo.price || 0;
		const discount = (this.state.newPromo.discount || 0) / 100;
		const sum = _.reduce(this.state.newPromo.options, (result, option) => {
			return result + (option.price || 0);
		}, 0);

		this.setState({
			total: _.round((price + sum) * (1 - discount))
		});
	}

	handleChangeMerchant(event) {
		this.setState({
			newPromo: Object.assign({}, this.state.newPromo, {merchant_id: parseInt(event.target.value, 10)})
		});
	}

	handleChangePrice(event) {
		const price = parseInt(event.target.value, 10);

		this.setState({
			newPromo: Object.assign({}, this.state.newPromo, {price: price})
		}, this.updateTotal);
	}

	handleChangeDiscount(event) {
		const discount = parseInt(event.target.value, 10);

		this.setState({
			newPromo: Object.assign({}, this.state.newPromo, {discount: discount})
		}, this.updateTotal);
	}

	handleChangeName(event) {
		this.setState({
			newPromo: Object.assign({}, this.state.newPromo, {name: (event.target.value || '')})
		});
	}

	handleSubmit() {
		if (this.validate()) {
			this.setState({
				isLoading: true
			}, () => {
				let promoData = _.omit(this.state.newPromo, 'merchant_id', 'discount');

				xhr.post('/promo/', {json: promoData}, (err, resp, data) => {
					if (!err && resp.statusCode === 201) {
						const promoId = data.id;
						const bindingData = _.assign(
							_.pick(this.state.newPromo, 'discount', 'options'),
							{promo_id: promoId}
						);
						const url = '/admin/merchant/' + this.state.newPromo.merchant_id + '/promo';

						xhr.put(url, {json: bindingData}, (err, resp) => {
							if (!err && resp.statusCode === 200) {
								window.location.href = '/admin/promo-list';
							} else {
								xhr.del('/promo/' + promoId, () => {
									this.setState({
										isLoading: false
									}, () => {
										toastr.error('Не удалось создать рекламный пакет. Попробуйте перезагрузить страницу.');
									});
								});
							}
						});
					} else {
						this.setState({
							isLoading: false
						}, () => {
							toastr.error('Не удалось создать рекламный пакет. Попробуйте перезагрузить страницу.');
						});
					}
				});
			});
		}
	}

	validate() {
		const newPromo = this.state.newPromo;

		if (!_.isNumber(newPromo.merchant_id)) {
			return false;
		}

		if (!newPromo.price) {
			return false;
		}

		if (!newPromo.name) {
			return false;
		}

		if (!newPromo.options.length) {
			return false;
		}

		const optionsValid = _.every(newPromo.options, option => {
			return _.isNumber(option.id) && (_.isBoolean(option.value) || _.isNumber(option.value));
		});

		if (!optionsValid) {
			return false;
		}

		return true;
	}

	render() {
		const rowHeight = 47;
		const submitDisabled = this.state.isLoading || !this.validate();

		return (
			<form className="row">
				<div className="panel panel-default">
					<div className="panel-heading">
						<label htmlFor="promo-maker-merchant">Магазин</label>
						<select
							id="promo-maker-merchant"
							className="form-control"
							value={this.state.newPromo.merchant_id}
							disabled={this.state.isLoading}
							onChange={this.handleChangeMerchant}
							>
							{this.state.merchants.map(merchant => {
								return (
									<option
										value={merchant.id}
										key={merchant.id}
										>
										{merchant.merchant_name}
									</option>
								);
							})}
						</select>
					</div>
				</div>

				<div className="col-sm-7">
					<table className="table table-striped" style={{tableLayout: 'fixed'}}>
						<colgroup>
							<col className="col-sm-1"/>
							<col className="col-sm-7"/>
							<col className="col-sm-2"/>
							<col className="col-sm-2"/>
						</colgroup>
						<thead>
							<tr>
								<th colSpan="2">Тарифы</th>
								<th colSpan="2">Custom VIP</th>
							</tr>
						</thead>
						<tbody>
							{this.state.regularOptions.map(option => {
								const optionIncluded = _.includes(
									_.flatMap(this.state.newPromo.options, 'id'),
									option.id
								);

								return (
									<PromoOption
										data={option}
										isRegular
										included={optionIncluded}
										rowHeight={rowHeight}
										key={option.id}
										/>
								);
							})}
						</tbody>
						<tfoot>
							<tr>
								<th colSpan="3">Стоимость</th>
								<th colSpan="1" className="text-right">
									<input
										type="text"
										className="form-control"
										style={{fontSize: 14}}
										pattern="\d+"
										disabled={this.state.isLoading}
										onChange={this.handleChangePrice}
										/>
								</th>
							</tr>
						</tfoot>
					</table>

					<table className="table table-striped" style={{tableLayout: 'fixed'}}>
						<colgroup>
							<col className="col-sm-1"/>
							<col className="col-sm-7"/>
							<col className="col-sm-2"/>
							<col className="col-sm-2"/>
						</colgroup>
						<thead>
							<tr>
								<th colSpan="4">Доп. опции</th>
							</tr>
						</thead>
						<tbody>
							{this.state.extraOptions.map(option => {
								const optionIncluded = _.includes(
									_.flatMap(this.state.newPromo.options, 'id'),
									option.id
								);

								return (
									<PromoOption
										data={option}
										isRegular={false}
										included={optionIncluded}
										rowHeight={rowHeight}
										key={option.id}
										/>
								);
							})}
						</tbody>
					</table>

					<div className="panel panel-default">
						<div className="panel-heading text-right">
							<div className="form-group">
								<div className="form-inline">
									<div className="form-group">
										<span className="form-control-static">
											Скидка&nbsp;(%):&nbsp;
										</span>
										<input
											type="number"
											className="form-control"
											min="0"
											max="100"
											value={this.state.newPromo.discount}
											disabled={this.state.isLoading}
											onChange={this.handleChangeDiscount}
											/>
									</div>
								</div>
							</div>
							<div className="form-group" style={{fontSize: 24}}>
								Итоговая сумма:&nbsp;
								<strong><Price cost={formatPrice(this.state.total) || 0} currency={'₽'}/></strong>
							</div>
							<div className="form-group text-right">
								<div className="form-inline">
									<div className="form-group">
										<span className="form-control-static">
											Название пакета:&nbsp;
										</span>
										<input
											type="text"
											className="form-control"
											value={this.state.newPromo.name}
											disabled={this.state.isLoading}
											onChange={this.handleChangeName}
											/>
									</div>
								</div>
							</div>

							<button
								className="btn btn-success"
								type="button"
								disabled={submitDisabled}
								onClick={this.handleSubmit}
								>
								Сохранить пакет
							</button>
						</div>
					</div>
				</div>
				<div className="col-sm-5">
					<PreDefinedPromoTable
						promoList={this.state.preDefinedPromos}
						optionList={this.state.regularOptions}
						rowHeight={rowHeight}
						/>
				</div>
			</form>
		);
	}
}
