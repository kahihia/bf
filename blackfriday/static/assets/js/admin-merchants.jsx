/* global window document toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN, ADVERTISER_IS_SUPERNOVA} from './admin/const.js';
import {hasRole} from './admin/utils.js';
import MerchantListFilter from './admin/advertisers/merchant-list-filter.jsx';
import ViewSwitcher from './admin/advertisers/view-switcher.jsx';
import MerchantTiles from './admin/advertisers/merchant-tiles.jsx';
import MerchantList from './admin/advertisers/merchant-list.jsx';
import AddMerchantForm from './admin/advertisers/add-merchant-form.jsx';

const CURRENT_VIEW = window.localStorage.getItem('merchant-list-view') || 'grid';

(function () {
	'use strict';

	const AdminMerchants = React.createClass({
		getInitialState() {
			return {
				merchants: [],
				filterByName: '',
				filterByStatus: '',
				filterByDate: 'ASC',
				filterByPromo: 0,
				filterBySupernovaAdvertiser: false,
				filterByInnerAdvertiser: '',
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
						const merchants = _.sortBy(data, 'id');
						this.setState({merchants});
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

		handleFilterBySupernovaAdvertiser(value) {
			this.setState({filterBySupernovaAdvertiser: value});
		},

		handleFilterByInnerAdvertiser(value) {
			this.setState({filterByInnerAdvertiser: value});
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
				if (item.promo) {
					if (item.promo.id === filterByPromo) {
						return true;
					}
				} else {
					if (filterByPromo === 9999) {
						return true;
					}

					return false;
				}
			});
		},

		filterBySupernovaAdvertiser(merchants) {
			const {filterBySupernovaAdvertiser} = this.state;

			if (!filterBySupernovaAdvertiser) {
				return merchants;
			}

			return _.filter(merchants, item => {
				return item.advertiser.isSupernova === true;
			});
		},

		filterByInnerAdvertiser(merchants) {
			const {filterByInnerAdvertiser} = this.state;

			if (!filterByInnerAdvertiser) {
				return merchants;
			}

			return _.filter(merchants, item => {
				return item.advertiser.inner === filterByInnerAdvertiser;
			});
		},

		handleClickMerchantAdd() {
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
				window.localStorage.setItem('merchant-list-view', view);
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
				filterByDate,
				filterByName,
				filterByPromo,
				filterByStatus,
				filterBySupernovaAdvertiser,
				filterByInnerAdvertiser,
				merchants,
				view
			} = this.state;

			let filteredMerchants = merchants;
			filteredMerchants = this.filterByName(filteredMerchants);
			filteredMerchants = this.filterByStatus(filteredMerchants);
			filteredMerchants = this.filterByDate(filteredMerchants);
			filteredMerchants = this.filterByPromo(filteredMerchants);
			filteredMerchants = this.filterBySupernovaAdvertiser(filteredMerchants);
			filteredMerchants = this.filterByInnerAdvertiser(filteredMerchants);

			const isAdmin = hasRole('admin');
			const isAdvertiser = hasRole('advertiser');
			const isManager = hasRole('manager');

			return (
				<div>
					{isAdmin || (isAdvertiser && !ADVERTISER_IS_SUPERNOVA) ? (
						<div>
							<button
								className="btn btn-success"
								onClick={this.handleClickMerchantAdd}
								type="button"
								>
								{'Добавить'}
							</button>

							<hr/>
						</div>
					) : null}

					{isAdmin || isManager ? (
						<MerchantListFilter
							onFilterByDate={this.handleFilterByDate}
							onFilterByName={this.handleFilterByName}
							onFilterByPromo={this.handleFilterByPromo}
							onFilterByStatus={this.handleFilterByStatus}
							onFilterBySupernovaAdvertiser={this.handleFilterBySupernovaAdvertiser}
							onFilterByInnerAdvertiser={this.handleFilterByInnerAdvertiser}
							{...{
								filterByDate,
								filterByName,
								filterByPromo,
								filterByStatus,
								filterBySupernovaAdvertiser,
								filterByInnerAdvertiser
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
						<MerchantList
							merchants={filteredMerchants}
							onClickMerchantDelete={this.handleClickMerchantDelete}
							onClickMerchantHide={this.handleClickMerchantHide}
							/>
					) : (
						<MerchantTiles
							merchants={filteredMerchants}
							onClickMerchantAdd={this.handleClickMerchantAdd}
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
