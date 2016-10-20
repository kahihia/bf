/* global window document jQuery toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {ENV, hasRole, processErrors, getUrl} from './admin/utils.js';
import ControlLabel from './admin/components/control-label.jsx';
import ImagesUpload from './admin/common/images-upload.jsx';
import MerchantEditForm from './admin/advertisers/merchant-edit-form.jsx';
import MerchantPartnersSelect from './admin/advertisers/merchant-partners-select.jsx';
import MerchantEditStatusPanel from './admin/advertisers/merchant-edit-status-panel.jsx';
import MerchantEditPromoSelect from './admin/advertisers/merchant-edit-promo-select.jsx';
import MerchantLogoCategoriesSelect from './admin/advertisers/merchant-logo-categories-select.jsx';
import MerchantBannerList from './admin/advertisers/merchant-banner-list.jsx';
import MerchantProductList from './admin/advertisers/merchant-product-list.jsx';

(function () {
	'use strict';

	const AdminMerchant = React.createClass({
		getInitialState() {
			return {
				banners: [],
				categories: [],
				categoriesLimit: 0,
				data: {},
				limits: {},
				logoCategories: [],
				merchantId: null,
				products: [],
				productsNew: []
			};
		},

		componentWillMount() {
			this.requestCategories();
			this.setState({merchantId: ENV.merchantId}, () => {
				this.requestLimits();
				this.requestMerchant();

				const hash = window.location.hash;
				if (/promo/.test(hash)) {
					this.openPromoSelectModal();
				}
			});
		},

		requestMerchant() {
			xhr({
				url: `/api/merchants/${this.state.merchantId}/`,
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						this.setState({data});
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось получить данные магазина');
						break;
					}
				}
			});
		},

		requestLimits() {
			xhr({
				url: `/api/merchants/${this.state.merchantId}/limits/`,
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						const limits = data.reduce((a, b) => {
							a[b.techName] = b.value;
							return a;
						}, {});
						this.setState({
							categoriesLimit: limits.categories || 0,
							limits
						});
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось получить данные рекламных возможностей');
						break;
					}
				}
			});
		},

		requestCategories() {
			xhr({
				url: '/api/categories/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						this.setState({categories: data});
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось получить список категорий');
						break;
					}
				}
			});
		},

		requestMerchantUploadLogo(image) {
			const json = {image};

			xhr({
				url: `/api/merchants/${this.state.merchantId}/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						this.setState({data});
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось загрузить логотип магазина');
						break;
					}
				}
			});
		},

		requestDelete() {
			xhr({
				url: `/api/merchants/${this.state.merchantId}/`,
				method: 'DELETE',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json: true
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 204: {
						window.location.pathname = getUrl('admin-merchants');
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось удалить магазин');
						break;
					}
				}
			});
		},

		requestModeration() {
			const json = {status: 1};

			xhr({
				url: `/api/merchants/${this.state.merchantId}/moderation/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						this.setState(previousState => {
							previousState.data.moderation = data;
							return previousState;
						});
						break;
					}
					case 400: {
						processErrors(data);
						break;
					}
					case 409: {
						toastr.warning('Не все материалы заполнены');
						break;
					}
					default: {
						toastr.error('Не удалось отправить магазин на модерацию');
						break;
					}
				}
			});
		},

		handleImagesUploadUpload(data) {
			this.requestMerchantUploadLogo(data.merchantId);
		},

		handleMerchantUpdate(data) {
			this.setState({data});
		},

		handleClickDelete() {
			if (window.confirm('Удалить магазин?')) {
				this.requestDelete();
			}
		},

		handleClickModeration() {
			this.requestModeration();
		},

		handleClickPromoSelect() {
			this.openPromoSelectModal();
		},

		handleClickPromoOptionsSelect() {
			this.openPromoSelectModal();
		},

		handleChangeLogoCategories(logoCategories) {
			this.setState({logoCategories});
		},

		handleChangeBanners(banners) {
			this.setState({banners});
		},

		handleChangeProducts({products, productsNew}) {
			if (!products) {
				products = this.state.products;
			}
			if (!productsNew) {
				productsNew = this.state.productsNew;
			}
			this.setState({products, productsNew});
		},

		openPromoSelectModal() {
			jQuery('#promo-select-modal').modal('show');
			const {
				data,
				merchantId
			} = this.state;
			const {
				paymentStatus,
				promo
			} = data;
			const activePromoId = promo ? promo.id : null;

			ReactDOM.render(
				<MerchantEditPromoSelect
					{...{
						activePromoId,
						merchantId,
						paymentStatus
					}}
					/>
				,
				document.getElementById('promo-select-form')
			);
		},

		collectCategoriesSelected() {
			const {
				banners,
				logoCategories,
				products,
				productsNew
			} = this.state;

			const selected = [];

			_.forEach(banners, item => {
				_.forEach(item.categories, item => {
					if (selected.indexOf(item.id) > -1) {
						return;
					}
					selected.push(item.id);
				});
			});

			_.forEach(logoCategories, item => {
				if (selected.indexOf(item) > -1) {
					return;
				}
				selected.push(item);
			});

			_.forEach(products, item => {
				if (!item.category) {
					return;
				}
				if (selected.indexOf(item.category.id) > -1) {
					return;
				}
				selected.push(item.category.id);
			});

			// TODO: category name aliasing
			_.forEach(productsNew, item => {
				_.forEach(item.categories, item => {
					if (selected.indexOf(item.id) > -1) {
						return;
					}
					selected.push(item.id);
				});
			});

			selected.sort();

			return selected;
		},

		collectCategoriesAvailable(categoriesSelected) {
			const {
				categories,
				categoriesLimit
			} = this.state;

			if (categoriesSelected.length < categoriesLimit) {
				return categories;
			}

			const categoriesAvailable = categories.reduce((a, b) => {
				if (categoriesSelected.indexOf(b.id) > -1) {
					a.push(b);
				}
				return a;
			}, []);

			return categoriesAvailable;
		},

		render() {
			const {
				data,
				limits,
				merchantId
			} = this.state;

			if (merchantId === null) {
				return null;
			}

			const categoriesSelected = this.collectCategoriesSelected();
			const categoriesAvailable = this.collectCategoriesAvailable(categoriesSelected);

			const {
				image,
				isPreviewable,
				moderation = {},
				optionsCount = 0,
				partners,
				paymentStatus,
				previewUrl,
				promo
			} = data;

			const moderationStatus = moderation.status;
			const moderationComment = moderation.comment;
			const promoName = promo ? promo.name : 'Не выбран';

			const isAdmin = hasRole('admin');
			const isAdvertiser = hasRole('advertiser');

			let isModerationAllowed = false;

			if (moderationStatus !== 1) {
				// TODO: Check is all merchant materials uploaded
				if (isAdmin || isAdvertiser) {
					isModerationAllowed = true;
				}
			}

			return (
				<div>
					<MerchantEditStatusPanel
						onClickDelete={this.handleClickDelete}
						onClickModeration={this.handleClickModeration}
						onClickPromoSelect={this.handleClickPromoSelect}
						onClickPromoOptionsSelect={this.handleClickPromoOptionsSelect}
						{...{
							isModerationAllowed,
							isPreviewable,
							moderationComment,
							moderationStatus,
							optionsCount,
							paymentStatus,
							previewUrl,
							promoName
						}}
						/>

					<div className="merchant-edit-block">
						<h2>
							{'Информация'}
						</h2>

						<div className="panel panel-default">
							<div className="panel-body">
								<MerchantEditForm
									onSubmit={this.handleMerchantUpdate}
									{...{
										data,
										merchantId
									}}
									/>

								<div className="form-group">
									<div className="col-xs-5">
										<ControlLabel name="Логотип"/>

										<div>
											<p>
												{image ? (
													<img
														src={image.url}
														alt=""
														/>
												) : null}
											</p>

											<ImagesUpload
												onUpload={this.handleImagesUploadUpload}
												ext={['png', 'jpg']}
												width="210"
												height="130"
												exactSize
												/>
										</div>
									</div>

									{limits.logo_categories ? (
										<div className="col-xs-7">
											<ControlLabel name="Категории размещения логотипа"/>

											<MerchantLogoCategoriesSelect
												categories={categoriesAvailable}
												limit={limits.logo_categories}
												onChange={this.handleChangeLogoCategories}
												{...{
													merchantId
												}}
												/>
										</div>
									) : null}
								</div>
							</div>
						</div>
					</div>

					{isAdmin ? (
						<MerchantPartnersSelect
							value={partners}
							{...{
								merchantId
							}}
							/>
					) : null}

					<MerchantBannerList
						onChange={this.handleChangeBanners}
						{...{
							categoriesAvailable,
							limits,
							merchantId
						}}
						/>

					<MerchantProductList
						onChange={this.handleChangeProducts}
						{...{
							categoriesAvailable,
							limits,
							merchantId
						}}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchant');
	ReactDOM.render(<AdminMerchant/>, block);
})();
