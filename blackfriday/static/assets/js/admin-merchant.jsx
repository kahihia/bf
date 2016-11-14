/* global window document jQuery toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {ENV, TOKEN} from './admin/const.js';
import {STATUS_DEFICIT_MESSAGE} from './admin/messages.js';
import {hasRole, processErrors, getUrl, isUTM} from './admin/utils.js';
import ControlLabel from './admin/components/control-label.jsx';
import ImagesUpload from './admin/common/images-upload.jsx';
import MerchantEditForm from './admin/advertisers/merchant-edit-form.jsx';
import MerchantEditHeader from './admin/advertisers/merchant-edit-header.jsx';
import MerchantPartnersSelect from './admin/advertisers/merchant-partners-select.jsx';
import MerchantEditStatusPanel from './admin/advertisers/merchant-edit-status-panel.jsx';
import MerchantEditPromoSelect from './admin/advertisers/merchant-edit-promo-select.jsx';
import MerchantLogoCategoriesSelect from './admin/advertisers/merchant-logo-categories-select.jsx';
import MerchantBannerList from './admin/advertisers/merchant-banner-list.jsx';
import MerchantProductList from './admin/advertisers/merchant-product-list.jsx';
import MerchantFakeSave from './admin/advertisers/merchant-fake-save.jsx';

(function () {
	'use strict';

	const AdminMerchant = React.createClass({
		propTypes: {
			merchantId: React.PropTypes.number.isRequired
		},

		getInitialState() {
			return {
				banners: [],
				categories: [],
				categoriesLimit: 0,
				data: {},
				limits: {},
				logoCategories: [],
				products: [],
				productsNew: []
			};
		},

		componentWillMount() {
			this.requestCategories();
			this.requestLimits();
			this.requestMerchant();

			const hash = window.location.hash;
			if (/promo/.test(hash)) {
				this.openPromoSelectModal();
			}
		},

		requestMerchant() {
			xhr({
				url: `/api/merchants/${this.props.merchantId}/`,
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
				url: `/api/merchants/${this.props.merchantId}/limits/`,
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
				url: `/api/categories/?available_to_merchant=${this.props.merchantId}`,
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				switch (resp.statusCode) {
					case 200: {
						this.setState({categories: _.sortBy(data, 'name')});
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
				url: `/api/merchants/${this.props.merchantId}/`,
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
				url: `/api/merchants/${this.props.merchantId}/`,
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
				url: `/api/merchants/${this.props.merchantId}/moderation/`,
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
						if (data.status && data.status.deficit) {
							processStatusDeficit(data.status.deficit);
						} else {
							processErrors(data);
						}
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
			this.requestMerchantUploadLogo(data.id);
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
				data
			} = this.state;
			const {
				merchantId
			} = this.props;
			const {
				paymentStatus,
				promo
			} = data;
			const activePromoId = promo ? promo.id : null;
			const isCustomPromo = promo ? promo.isCustom : false;

			ReactDOM.render(
				<MerchantEditPromoSelect
					{...{
						activePromoId,
						isCustomPromo,
						merchantId,
						paymentStatus
					}}
					/>
				,
				document.getElementById('promo-select-form')
			);
		},

		getCategoryIdByName(name) {
			let categoryId = null;
			_.forEach(this.state.categories, category => {
				if (
					category.name &&
					typeof category.name === 'string' &&
					category.name.toLowerCase() === name
				) {
					categoryId = category.id;
					return false;
				}
			});
			return categoryId;
		},

		collectCategoriesSelected() {
			const {
				banners,
				limits,
				logoCategories,
				products,
				productsNew
			} = this.state;

			const selected = [];

			_.forEach(products, item => {
				if (!item.category) {
					return;
				}
				if (selected.indexOf(item.category.id) > -1) {
					return;
				}
				selected.push(item.category.id);
			});

			const extraBannerCategories = limits.extra_banner_categories || 0;

			_.forEach(banners, item => {
				if (extraBannerCategories && item.type === 10) {
					return;
				}
				_.forEach(item.categories, item => {
					if (selected.indexOf(item.id) > -1) {
						return;
					}
					selected.push(item.id);
				});
			});

			_.forEach(logoCategories, item => {
				if (selected.length >= limits.categories) {
					return false;
				}
				if (selected.indexOf(item) > -1) {
					return;
				}
				selected.push(item);
			});

			if (extraBannerCategories) {
				_.forEach(banners, item => {
					if (item.type !== 10) {
						return;
					}
					_.forEach(item.categories, item => {
						if (selected.length >= limits.categories) {
							return false;
						}
						if (selected.indexOf(item.id) > -1) {
							return;
						}
						selected.push(item.id);
					});
				});
			}

			_.forEach(productsNew, item => {
				if (selected.length >= limits.categories) {
					return false;
				}
				const categoryId = this.getCategoryIdByName(item.data.category);
				if (selected.indexOf(categoryId) > -1) {
					return;
				}
				selected.push(categoryId);
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

		validateMerchantData() {
			const {data} = this.state;
			const required = [
				'name',
				'url',
				'description'
			];
			const result = [];

			_.forEach(required, name => {
				if (!data[name]) {
					result.push(name);
				}
			});

			const image = {
				name: 'logo',
				data: []
			};
			if (!data.image) {
				image.data.push('image');
			}
			const logoCategories = this.validateMerchantLogoCategories();
			if (logoCategories) {
				image.data.push(logoCategories);
			}
			if (image.data.length) {
				result.push(image);
			}

			return {
				name: 'data',
				data: result
			};
		},

		validateMerchantLogoCategories() {
			const {
				limits,
				logoCategories
			} = this.state;
			let result = null;

			if (limits.logo_categories && limits.logo_categories !== logoCategories.length) {
				result = {
					name: 'logo_categories',
					value: limits.logo_categories - logoCategories.length
				};
			}

			return result;
		},

		validateMerchantBanners() {
			const {
				limits,
				banners
			} = this.state;
			const result = [];

			if (limits.superbanners) {
				const b = _.filter(banners, {type: 0});
				const data = [];

				const count = getBannerLeftCount(b, limits.superbanners);
				if (count) {
					data.push(count);
				}

				const categories = limits.superbanner_categories - b.reduce((counter, banner) => (counter + banner.categories.length), 0);
				if (categories) {
					data.push({
						name: 'categories',
						value: categories
					});
				}

				const onMain = getBannerLeftOnMain(b, limits.superbanner_on_main);
				if (onMain) {
					data.push(onMain);
				}

				const inMailing = getBannerLeftInMailing(b, limits.superbanner_in_mailing);
				if (inMailing) {
					data.push(inMailing);
				}

				const utm = getBannerLeftUTM(b);
				if (utm) {
					data.push(utm);
				}

				if (data.length) {
					result.push({
						name: 'superbanners',
						data
					});
				}
			}

			if (limits.banners) {
				const b = _.filter(banners, {type: 10});
				const data = [];

				const count = getBannerLeftCount(b, limits.banners);
				if (count) {
					data.push(count);
				}

				const categoriesSelected = [];
				let categoriesPositions = limits.banner_positions;
				b.forEach(banner => {
					if (banner.categories && banner.categories.length) {
						banner.categories.forEach(category => {
							categoriesPositions -= 1;

							const categoryId = category.id;
							if (categoriesSelected.indexOf(categoryId) === -1) {
								categoriesSelected.push(categoryId);
							}
						});
					}
				});
				const extraCategories = limits.extra_banner_categories || 0;
				const categories = limits.categories + extraCategories - categoriesSelected.length;
				if (categories) {
					data.push({
						name: 'categories',
						value: categories
					});
				}
				if (categoriesPositions) {
					data.push({
						name: 'positions',
						value: categoriesPositions
					});
				}

				const onMain = getBannerLeftOnMain(b, limits.banner_on_main);
				if (onMain) {
					data.push(onMain);
				}

				const inMailing = getBannerLeftInMailing(b, limits.banner_in_mailing);
				if (inMailing) {
					data.push(inMailing);
				}

				const utm = getBannerLeftUTM(b);
				if (utm) {
					data.push(utm);
				}

				if (data.length) {
					result.push({
						name: 'banners',
						data
					});
				}
			}

			if (limits.vertical_banners) {
				const b = _.filter(banners, {type: 20});
				const data = [];

				const count = limits.vertical_banners - b.length;
				if (count) {
					data.push({
						name: 'banner_count',
						value: count
					});
				}

				const utm = getBannerLeftUTM(b);
				if (utm) {
					data.push(utm);
				}

				if (data.length) {
					result.push({
						name: 'vertical_banners',
						data
					});
				}
			}

			// TODO: Backgrounds
			// if (limits.main_backgrounds || limits.category_backgrounds) {
			//     const bannersLeft = _.filter(banners, {type: 30});
			//     const bannersRight = _.filter(banners, {type: 40});

			//     if (limits.main_backgrounds) {
			//     }

			//     if (limits.category_backgrounds) {
			//     }
			// }

			return {
				name: 'banners',
				data: result
			};
		},

		validateMerchantProducts() {
			const {
				limits,
				products
			} = this.state;
			const result = [];

			if (limits.products) {
				if (products.length < limits.products) {
					result.push({
						name: 'positions',
						value: limits.products - products.length
					});
				}

				if (limits.teasers) {
					const teasers = _.filter(products, {isTeaser: true}).length;
					const teaserPositions = limits.teasers - teasers;
					if (teaserPositions > 0) {
						result.push({
							name: 'teasers',
							value: teaserPositions
						});
					}
				}

				if (limits.teasers_on_main) {
					const teasers = _.filter(products, {isTeaserOnMain: true}).length;
					const teaserOnMainPositions = limits.teasers_on_main - teasers;
					if (teaserOnMainPositions > 0) {
						result.push({
							name: 'teasers_on_main',
							value: teaserOnMainPositions
						});
					}
				}
			}

			return {
				name: 'products',
				data: result
			};
		},

		handleClickFakeSave(cb) {
			const result = [];

			result.push(this.validateMerchantData());
			result.push(this.validateMerchantBanners());
			result.push(this.validateMerchantProducts());

			cb(result);
		},

		render() {
			const {
				categories,
				data,
				limits
			} = this.state;
			const {
				merchantId
			} = this.props;

			const categoriesSelected = this.collectCategoriesSelected();
			const categoriesAvailable = this.collectCategoriesAvailable(categoriesSelected);
			const categoriesHighlighted = categoriesSelected;

			const {
				image,
				isPreviewable,
				moderation = {},
				name,
				optionsCount = 0,
				partners,
				paymentStatus,
				previewUrl,
				promo,
				url
			} = data;

			const moderationStatus = moderation.status;
			const moderationComment = moderation.comment;
			const promoName = promo ? promo.name : 'Не выбран';

			const isAdmin = hasRole('admin');

			return (
				<div>
					<MerchantEditHeader
						{...{
							name,
							url
						}}
						/>

					<MerchantEditStatusPanel
						onClickDelete={this.handleClickDelete}
						onClickModeration={this.handleClickModeration}
						onClickPromoSelect={this.handleClickPromoSelect}
						onClickPromoOptionsSelect={this.handleClickPromoOptionsSelect}
						{...{
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
											{image ? (
												<p>
													<img
														src={image.url}
														alt=""
														/>
												</p>
											) : null}

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
												categoriesAvailable={categoriesAvailable.length >= limits.logo_categories ? categoriesAvailable : categories}
												limit={limits.logo_categories}
												onChange={this.handleChangeLogoCategories}
												{...{
													categoriesHighlighted,
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
							categories,
							categoriesAvailable,
							categoriesHighlighted,
							categoriesSelected,
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

					<MerchantFakeSave onClickSave={this.handleClickFakeSave}/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchant');
	ReactDOM.render(<AdminMerchant merchantId={ENV.merchantId}/>, block);
})();

function processStatusDeficit(deficit) {
	const messages = deficit.map(name => (STATUS_DEFICIT_MESSAGE[name] || name));
	const message = '<ul style="padding-left: 18px"><li>' + messages.join('</li><li>') + '</li></ul>';
	toastr.warning(message, 'Не все данные заполнены');
}

function getBannerLeftCount(banners, limit) {
	const value = limit - banners.length;
	if (value) {
		return {name: 'banner_count', value};
	}
	return null;
}

function getBannerLeftOnMain(banners, limit) {
	const value = limit - _.filter(banners, {onMain: true}).length;
	if (value) {
		return {name: 'on_main', value};
	}
	return null;
}

function getBannerLeftInMailing(banners, limit) {
	const value = limit - _.filter(banners, {inMailing: true}).length;
	if (value) {
		return {name: 'in_mailing', value};
	}
	return null;
}

function getBannerLeftUTM(banners) {
	const value = banners.reduce((counter, banner) => (isUTM(banner.url) ? counter : counter + 1), 0);
	if (value) {
		return {name: 'utm', value};
	}
	return null;
}
