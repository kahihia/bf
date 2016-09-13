/* global window, toastr, FormData, _ */
/* eslint-disable no-alert */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {hasRole} from '../utils.js';
import Icon from '../components/icon.jsx';
import FormRow from '../components/form-row.jsx';
import Radio from '../components/radio.jsx';
import Select from '../components/select.jsx';
import SimpleShopCard from '../advertiser/simple-shop-card.jsx';

function MerchantAddShop() {
	return (
		<a
			className="merchant-add-shop"
			href="/admin/merchant/create"
			>
			<Icon name="merchant-add-shop"/>
			<span className="merchant-add-shop__text">
				{'Добавить магазин'}
			</span>
		</a>
	);
}

const MerchantsList = React.createClass({
	getInitialState() {
		return {
			data: [],
			availablePromo: [],
			filterByName: '',
			filterByStatus: '',
			filterByDate: 'ASC',
			filterByPromo: ''
		};
	},

	componentDidMount() {
		xhr({
			url: '/admin/merchants',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				let availablePromo = [];
				if (hasRole('admin') || hasRole('manager')) {
					availablePromo = this.collectAvailablePromo(data);
				}
				this.setState({data, availablePromo});
			} else {
				toastr.error('Не удалось получить список продавцов');
			}
		});
	},

	collectAvailablePromo(data) {
		return data.reduce((a, b) => {
			const promo = b.promo_name;
			if (promo && a.indexOf(promo) === -1) {
				a.push(promo);
			}

			return a;
		}, ['']).map(a => {
			return {
				name: a,
				id: a
			};
		});
	},

	handleClickHideMerchantContent(merchantId, isActive) {
		if (window.confirm(isActive ? 'Показывать контент продавца?' : 'Скрыть контент продавца?')) {
			this.requestHideMerchantContent(merchantId, isActive);
		}
	},

	requestHideMerchantContent(merchantId, isActive) {
		const formData = new FormData();
		formData.append('id', merchantId);
		formData.append('active', isActive);

		xhr({
			url: '/admin/merchant/save',
			method: 'POST',
			body: formData
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				toastr.success('Настройки сохранены');
				const merchant = this.getMerchantById(merchantId);
				merchant.merchant_active = isActive;
				this.forceUpdate();
			} else {
				toastr.error('Не удалось обновить настройки');
			}
		});
	},

	getMerchantById(id) {
		return _.find(this.state.data, {id});
	},

	handleChangeFilterByName(e) {
		this.setState({filterByName: e.target.value});
	},

	handleChangeFilterByStatus(value) {
		this.setState({filterByStatus: value});
	},

	handleChangeFilterByDate(value) {
		this.setState({filterByDate: value});
	},

	handleChangeFilterByPromo(value) {
		this.setState({filterByPromo: value});
	},

	filterByName(data) {
		const {filterByName} = this.state;
		if (!filterByName) {
			return data;
		}

		return _.filter(data, item => {
			const name = item.merchant_name;
			if (!name) {
				return false;
			}
			return name.toLowerCase().indexOf(filterByName.toLowerCase()) > -1;
		});
	},

	filterByStatus(data) {
		const {filterByStatus} = this.state;
		if (!filterByStatus) {
			return data;
		}

		return _.filter(data, item => {
			return item.invoice_status === filterByStatus;
		});
	},

	filterByDate(data) {
		const {filterByDate} = this.state;
		if (!filterByDate) {
			return data;
		}

		if (filterByDate === 'DESC') {
			return _.clone(data).reverse();
		}
		return data;
	},

	filterByPromo(data) {
		const {filterByPromo} = this.state;
		if (!filterByPromo) {
			return data;
		}

		return _.filter(data, item => {
			return item.promo_name === filterByPromo;
		});
	},

	render() {
		const {data} = this.state;

		let filteredData = data;
		filteredData = this.filterByName(filteredData);
		filteredData = this.filterByStatus(filteredData);
		filteredData = this.filterByDate(filteredData);
		filteredData = this.filterByPromo(filteredData);

		return (
			<div className="">
				{hasRole('admin') || hasRole('manager') ? (
					<div className="form">
						<div className="row">
							<div className="col-sm-3">
								<FormRow
									label="Название"
									value={this.state.filterByName}
									onChange={this.handleChangeFilterByName}
									/>
							</div>

							<div className="col-sm-3">
								<div className="form-group">
									<div className="control-label">
										Дата создания
									</div>
									<Radio
										name="Сначала новые"
										value="ASC"
										isChecked={this.state.filterByDate === 'ASC'}
										onChange={this.handleChangeFilterByDate}
										/>
									<Radio
										name="Сначала старые"
										value="DESC"
										isChecked={this.state.filterByDate === 'DESC'}
										onChange={this.handleChangeFilterByDate}
										/>
								</div>
							</div>

							<div className="col-sm-3">
								<div className="form-group">
									<div className="control-label">
										Статус оплаты
									</div>
									<Radio
										name="Все"
										value=""
										isChecked={this.state.filterByStatus === ''}
										onChange={this.handleChangeFilterByStatus}
										/>
									<Radio
										name="Оплачен"
										value="paid"
										isChecked={this.state.filterByStatus === 'paid'}
										onChange={this.handleChangeFilterByStatus}
										/>
									<Radio
										name="Не оплачен"
										value="waiting"
										isChecked={this.state.filterByStatus === 'waiting'}
										onChange={this.handleChangeFilterByStatus}
										/>
								</div>
							</div>

							<div className="col-sm-3">
								<div className="form-group">
									<div className="control-label">
										Тариф
									</div>
									<Select
										options={this.state.availablePromo}
										selected={this.state.filterByPromo}
										onChange={this.handleChangeFilterByPromo}
										/>
								</div>
							</div>
						</div>
					</div>
				) : null}

				<div className="merchant-shop-card-list">
					<div className="merchant-shop-card-list__item">
						<MerchantAddShop/>
					</div>

					{filteredData.map(model => {
						return (
							<div
								key={model.id}
								className="merchant-shop-card-list__item"
								>
								<SimpleShopCard
									data={model}
									onClickHideContent={this.handleClickHideMerchantContent}
									/>
							</div>
						);
					})}
				</div>
			</div>
		);
	}
});

export default MerchantsList;
