/* global window document toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {hasRole} from './admin/utils.js';
import MerchantsListFilter from './admin/advertisers/merchants-list-filter.jsx';
import ViewSwitcher from './admin/advertisers/view-switcher.jsx';
import MerchantsTiles from './admin/advertisers/merchants-tiles.jsx';
import MerchantsList from './admin/advertisers/merchants-list.jsx';
import AddMerchantForm from './admin/advertisers/add-merchant-form.jsx';

const CURRENT_VIEW = window.localStorage.getItem('merchants-list-view') || 'grid';

(function () {
	'use strict';

	const AdminMerchants = React.createClass({
		getInitialState() {
			return {
				merchants: [],
				availablePromo: [],
				filterByName: '',
				filterByStatus: '',
				filterByDate: 'ASC',
				filterByPromo: '',
				view: CURRENT_VIEW
			};
		},

		componentWillMount() {
			this.requestMerchants();
		},

		requestMerchants() {
			xhr({
				url: '/api/merchants/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						let availablePromo = [];
						if (hasRole('admin') || hasRole('manager')) {
							availablePromo = this.collectAvailablePromo(data);
						}
						this.setState({
							merchants: _.sortBy(data, 'id'),
							availablePromo
						});
					}
				} else {
					toastr.error('Не удалось получить список магазинов');
				}
			});
		},

		requestMerchantDelete(id) {
			this.setState({isLoading: true});

			xhr({
				url: `/api/merchants/${id}/`,
				method: 'DELETE',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				switch (resp.statusCode) {
					case 204: {
						this.deleteMerchant(id);
						break;
					}
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось удалить магазин');
						break;
					}
				}
			});
		},

		requestMerchantHide(id, isActive) {
			this.setState({isLoading: true});

			xhr({
				url: `/api/merchants/${id}/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: {isActive}
			}, (err, resp, data) => {
				this.setState({isLoading: false});

				switch (resp.statusCode) {
					case 200: {
						this.updateMerchant(id, data);
						break;
					}
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось обновить магазин');
						break;
					}
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

		getMerchantById(id) {
			return _.find(this.state.merchants, {id});
		},

		addMerchant(merchant) {
			if (merchant) {
				this.setState(previousState => {
					previousState.merchants.push(merchant);
					return previousState;
				});
			}
		},

		deleteMerchant(id) {
			this.setState(previousState => {
				_.remove(previousState.merchants, merchant => {
					return merchant.id === id;
				});
				return previousState;
			});
		},

		updateMerchant(id, merchantData) {
			this.setState(previousState => {
				const merchant = this.getMerchantById(id);
				_.merge(merchant, merchantData);
				return previousState;
			});
		},

		handleFilterByName(value) {
			this.setState({filterByName: value});
		},

		handleFilterByStatus(value) {
			this.setState({filterByStatus: value});
		},

		handleFilterByDate(value) {
			this.setState({filterByDate: value});
		},

		handleFilterByPromo(value) {
			this.setState({filterByPromo: value});
		},

		filterByName(merchants) {
			const {filterByName} = this.state;
			if (!filterByName) {
				return merchants;
			}

			return _.filter(merchants, item => {
				const name = item.name;
				if (!name) {
					return false;
				}
				return name.toLowerCase().indexOf(filterByName.toLowerCase()) > -1;
			});
		},

		filterByStatus(merchants) {
			const {filterByStatus} = this.state;
			if (!filterByStatus) {
				return merchants;
			}

			return _.filter(merchants, item => {
				return item.paymentStatus === filterByStatus;
			});
		},

		filterByDate(merchants) {
			const {filterByDate} = this.state;
			if (!filterByDate || filterByDate === 'DESC') {
				return merchants;
			}

			return _.clone(merchants).reverse();
		},

		filterByPromo(merchants) {
			const {filterByPromo} = this.state;
			if (!filterByPromo) {
				return merchants;
			}

			return _.filter(merchants, item => {
				return item.promo_name === filterByPromo;
			});
		},

		handleClickAdd() {
			const $modal = jQuery('#add-merchant-modal');
			$modal.modal('show');
			const onSubmit = merchant => {
				this.addMerchant(merchant);

				$modal.modal('hide');
			};
			ReactDOM.render(
				<AddMerchantForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-merchant-form')
			);
		},

		handleClickViewSwitcher(view) {
			this.setState({view}, () => {
				window.localStorage.setItem('merchants-list-view', view);
			});
		},

		handleClickMerchantDelete(id) {
			if (window.confirm('Удалить магазин?')) {
				this.requestMerchantDelete(id);
			}
		},

		handleClickMerchantHide(id, isActive) {
			if (window.confirm(isActive ? 'Показывать контент продавца?' : 'Скрыть контент продавца?')) {
				this.requestMerchantHide(id, isActive);
			}
		},

		render() {
			const {
				availablePromo,
				filterByDate,
				filterByName,
				filterByPromo,
				filterByStatus,
				merchants,
				view
			} = this.state;

			let filteredMerchants = merchants;
			filteredMerchants = this.filterByName(filteredMerchants);
			filteredMerchants = this.filterByStatus(filteredMerchants);
			filteredMerchants = this.filterByDate(filteredMerchants);
			filteredMerchants = this.filterByPromo(filteredMerchants);

			const isAdmin = hasRole('admin');
			const isAdvertiser = hasRole('advertiser');
			const isManager = hasRole('manager');

			return (
				<div>
					{isAdmin || isAdvertiser ? (
						<div>
							<button
								className="btn btn-success"
								onClick={this.handleClickAdd}
								type="button"
								>
								{'Добавить'}
							</button>

							<hr/>
						</div>
					) : null}

					{isAdmin || isManager ? (
						<MerchantsListFilter
							onFilterByDate={this.handleFilterByDate}
							onFilterByName={this.handleFilterByName}
							onFilterByPromo={this.handleFilterByPromo}
							onFilterByStatus={this.handleFilterByStatus}
							{...{
								availablePromo,
								filterByDate,
								filterByName,
								filterByPromo,
								filterByStatus
							}}
							/>
					) : null}

					<p>
						<ViewSwitcher
							onClick={this.handleClickViewSwitcher}
							view={view}
							/>
					</p>

					{view === 'list' ? (
						<MerchantsList
							merchants={filteredMerchants}
							onClickMerchantDelete={this.handleClickMerchantDelete}
							onClickMerchantHide={this.handleClickMerchantHide}
							/>
					) : (
						<MerchantsTiles
							merchants={filteredMerchants}
							onClickAdd={this.handleClickAdd}
							onClickMerchantDelete={this.handleClickMerchantDelete}
							onClickMerchantHide={this.handleClickMerchantHide}
							/>
					)}
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchants');
	ReactDOM.render(<AdminMerchants/>, block);
})();
