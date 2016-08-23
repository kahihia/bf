/* global React, document, jQuery, toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import xhr from 'xhr';
import MultiselectControls from './multiselect-controls.jsx';

const FeedMaker = React.createClass({
	basePath: '/yml/download',

	getInitialState() {
		const initialData = {
			filename: '',
			merchants: [],
			merchantExcludes: [],
			categories: [],
			categoryExcludes: [],
			excludes: [],
			bindUrl: 'url',
			bindUrlCat: 'url_cat',
			bindUrlShop: 'url_shop',
			utmSource: '',
			utmMedium: '',
			utmCampaign: '',
			showTeaserCat: false
		};

		return {
			data: initialData,
			merchantList: [],
			categoryList: [],
			link: this.basePath,
			isLoading: true,
			loadingError: false
		};
	},

	componentDidMount() {
		let self = this;

		xhr.get('/admin/merchants-with-categories', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({
					merchantList: data
				}, function () {
					xhr.get('/admin/categories-with-merchants', {json: true}, (err, resp, data) => {
						if (!err && resp.statusCode === 200) {
							self.setState({
								categoryList: data,
								isLoading: false
							}, this.buildLink);
						} else {
							self.setState({
								isLoading: false,
								loadingError: true
							}, function () {
								toastr.error('Не удалось получить список категорий.');
							});
						}
					});
				});
			} else {
				self.setState({
					isLoading: false,
					loadingError: true
				}, function () {
					toastr.error('Не удалось получить список магазинов.');
				});
			}
		});

		jQuery(document).ready(function ($) {
			$('select[id$="-multiselect"]').each(function (i, select) {
				const $select = $(select);
				const prefix = $select.data('prefix');
				const filterId = `#${$select.data('filter-id')}`;

				function _updateMerchants($toSelect, dataField) {
					const idList = $toSelect.find('option').map(function (i, option) {
						return parseInt(option.value, 10);
					}).get();
					let newData = {};

					newData[dataField] = idList;

					self.setState({
						data: Object.assign({}, self.state.data, newData)
					}, self.buildLink);

					_filters(dataField);
				}

				function _filters(dataField) {
					const selectListName = (dataField === 'merchants' || dataField === 'merchantExcludes') ? 'merchantList' : 'categoryList';
					const filterListName = (dataField === 'merchants' || dataField === 'merchantExcludes') ? 'category' : 'merchants';
					const selectId = self.state.data[dataField];

					const selected = [...document.querySelector(filterId)]
						.map(({value}) => Number(value))
						.filter(id => {
							return self.state[selectListName]
								.filter(({id}) => {
									return selectId.indexOf(id) !== -1;
								})
								.reduce((previousValue, {[filterListName]: currentValue}) => {
									return previousValue.concat(currentValue);
								}, []).indexOf(id) !== -1;
						});

					if (selected.length) {
						$(`${filterId} option`).hide();
						selected
							.forEach(value => {
								$(`${filterId} [value=${value}]`).show();
							});
					} else {
						$(`${filterId} option`).show();
					}
				}

				$select.multiselect({
					right: '#' + prefix + '-multiselect-to',

					rightAll: '#' + prefix + '-multiselect-right-all',
					rightSelected: '#' + prefix + '-multiselect-right-selected',
					leftAll: '#' + prefix + '-multiselect-left-all',
					leftSelected: '#' + prefix + '-multiselect-left-selected',

					afterMoveOneToRight: function ($fromSelect, $toSelect) {
						_updateMerchants($toSelect, prefix);
					},
					afterMoveAllToRight: function ($fromSelect, $toSelect) {
						_updateMerchants($toSelect, prefix);
					},
					afterMoveOneToLeft: function ($fromSelect, $toSelect) {
						_updateMerchants($toSelect, prefix);
					},
					afterMoveAllToLeft: function ($fromSelect, $toSelect) {
						_updateMerchants($toSelect, prefix);
					}
				});
			});
		});
	},

	handleChangeFilename(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {filename: event.target.value})
		}, this.buildLink);
	},

	handleChangeExcludes(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {excludes: _.xor(this.state.data.excludes, [event.target.name])})
		}, this.buildLink);
	},

	handleChangeBindUrl(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {bindUrl: event.target.value})
		}, this.buildLink);
	},

	handleChangeBindUrlCat(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {bindUrlCat: event.target.value})
		}, this.buildLink);
	},

	handleChangeBindUrlShop(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {bindUrlShop: event.target.value})
		}, this.buildLink);
	},

	handleChangeUtmSource(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {utmSource: event.target.value})
		}, this.buildLink);
	},

	handleChangeUtmMedium(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {utmMedium: event.target.value})
		}, this.buildLink);
	},

	handleChangeUtmCampaign(event) {
		this.setState({
			data: Object.assign({}, this.state.data, {utmCampaign: event.target.value})
		}, this.buildLink);
	},

	handleChangeShowTeaserCat() {
		this.setState({
			data: Object.assign({}, this.state.data, {showTeaserCat: !this.state.data.showTeaserCat})
		}, this.buildLink);
	},

	buildLink() {
		let params = {};
		let link;

		if (this.state.data.filename) {
			params.filename = this.state.data.filename;
		}

		if (this.state.data.merchants.length) {
			params['merchants[]'] = this.state.data.merchants;
		}

		if (this.state.data.categories.length) {
			params['categories[]'] = this.state.data.categories;
		}

		if (this.state.data.merchantExcludes.length) {
			params['exclude_merchants[]'] = this.state.data.merchantExcludes;
		}

		if (this.state.data.categoryExcludes.length) {
			params['exclude_categories[]'] = this.state.data.categoryExcludes;
		}

		if (this.state.data.excludes.length) {
			params['excludes[]'] = this.state.data.excludes;
		}

		if (this.state.data.bindUrl) {
			params.bind_url = this.state.data.bindUrl;
		}

		if (this.state.data.bindUrlCat) {
			params.bind_url_cat = this.state.data.bindUrlCat;
		}

		if (this.state.data.bindUrlShop) {
			params.bind_url_shop = this.state.data.bindUrlShop;
		}

		if (this.state.data.utmSource) {
			params.utm_source = this.state.data.utmSource;
		}

		if (this.state.data.utmMedium) {
			params.utm_medium = this.state.data.utmMedium;
		}

		if (this.state.data.utmCampaign) {
			params.utm_campaign = this.state.data.utmCampaign;
		}

		if (this.state.data.showTeaserCat) {
			params.show_teaser_cat = 'true';
		}

		if (_.isEmpty(params)) {
			link = this.basePath;
		} else {
			link = this.basePath + '?' + _.map(params, function (value, key) {
				let result;

				if (_.isArray(value)) {
					result = _.map(value, function (item) {
						return key + '=' + encodeURIComponent(item);
					}).join('&');
				} else {
					result = key + '=' + encodeURIComponent(value);
				}

				return result;
			}).join('&');
		}

		this.setState({
			link: link
		});
	},

	render() {
		return (
			<div className="row">
				<div className="col-sm-12">
					<div className="form-group">
						<label htmlFor="feed-maker-filename">Название файла (без расширения)</label>
						<input
							type="text"
							className="form-control"
							id="feed-maker-filename"
							value={this.state.data.filename}
							disabled={this.state.isLoading}
							onChange={this.handleChangeFilename}
							/>
					</div>
				</div>

				<div className="col-sm-12">
					<div className="h2">1. Мерчанты и категории</div>
					<div className="row">
						<div className="col-sm-12">
							<p>
								<small className="text-muted">
									Обратите внимание, товары списка "исключить" имеют приоритет.
								</small>
							</p>
						</div>
						<div className="col-sm-6">
							<div className="h3">Включить</div>
							<div className="form-group">
								<label>Мерчанты</label>
								<div className="row">
									<div className="col-sm-5">
										<select
											className="form-control"
											id="merchants-multiselect"
											multiple
											data-prefix="merchants"
											data-filter-id="categories-multiselect"
											disabled={this.state.isLoading || !this.state.merchantList.length}
											>
											{this.state.merchantList.map(merchant => {
												return (
													<option value={merchant.id} key={merchant.id}>{merchant.name}</option>
												);
											})}
										</select>
									</div>
									<div className="col-sm-2">
										<MultiselectControls
											prefix="merchants"
											disabled={this.state.isLoading || !this.state.merchantList.length}
											/>
									</div>
									<div className="col-sm-5">
										<select
											className="form-control"
											id="merchants-multiselect-to"
											multiple
											disabled={this.state.isLoading || !this.state.merchantList.length}
											/>
									</div>
								</div>
							</div>
							<div className="form-group">
								<label>Категории</label>
								<div className="row">
									<div className="col-sm-5">
										<select
											className="form-control"
											id="categories-multiselect"
											multiple
											data-prefix="categories"
											data-filter-id="merchants-multiselect"
											disabled={this.state.isLoading || !this.state.categoryList.length}
											>
											{this.state.categoryList.map(category => {
												return (
													<option value={category.id} key={category.id}>{category.name}</option>
												);
											})}
										</select>
									</div>
									<div className="col-sm-2">
										<MultiselectControls
											prefix="categories"
											disabled={this.state.isLoading || !this.state.categoryList.length}
											/>
									</div>
									<div className="col-sm-5">
										<select
											className="form-control"
											id="categories-multiselect-to"
											multiple
											disabled={this.state.isLoading || !this.state.categoryList.length}
											/>
									</div>
								</div>
							</div>
						</div>
						<div className="col-sm-6">
							<div className="h3">Исключить</div>
							<div className="form-group">
								<label>Мерчанты</label>
								<div className="row">
									<div className="col-sm-5">
										<select
											className="form-control"
											id="merchantExcludes-multiselect"
											multiple
											data-prefix="merchantExcludes"
											data-filter-id="categoryExcludes-multiselect"
											disabled={this.state.isLoading || !this.state.merchantList.length}
											>
											{this.state.merchantList.map(merchant => {
												return (
													<option value={merchant.id} key={merchant.id}>{merchant.name}</option>
												);
											})}
										</select>
									</div>
									<div className="col-sm-2">
										<MultiselectControls
											prefix="merchantExcludes"
											disabled={this.state.isLoading || !this.state.merchantList.length}
											/>
									</div>
									<div className="col-sm-5">
										<select
											className="form-control"
											id="merchantExcludes-multiselect-to"
											multiple
											disabled={this.state.isLoading || !this.state.merchantList.length}
											/>
									</div>
								</div>
							</div>
							<div className="form-group">
								<label>Категории</label>
								<div className="row">
									<div className="col-sm-5">
										<select
											className="form-control"
											id="categoryExcludes-multiselect"
											multiple
											data-prefix="categoryExcludes"
											data-filter-id="merchantExcludes-multiselect"
											disabled={this.state.isLoading || !this.state.categoryList.length}
											>
											{this.state.categoryList.map(category => {
												return (
													<option value={category.id} key={category.id}>{category.name}</option>
												);
											})}
										</select>
									</div>
									<div className="col-sm-2">
										<MultiselectControls
											prefix="categoryExcludes"
											disabled={this.state.isLoading || !this.state.categoryList.length}
											/>
									</div>
									<div className="col-sm-5">
										<select
											className="form-control"
											id="categoryExcludes-multiselect-to"
											multiple
											disabled={this.state.isLoading || !this.state.categoryList.length}
											/>
									</div>
								</div>
							</div>
						</div>
					</div>
				</div>

				<div className="col-sm-12">
					<div className="h2">2. Исключить теги</div>
					<div className="row">
						<div className="col-sm-6">
							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="discount"
										checked={this.state.data.excludes.indexOf('discount') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									Discount
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="url"
										checked={this.state.data.excludes.indexOf('url') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									url
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="url_cat"
										checked={this.state.data.excludes.indexOf('url_cat') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									url_cat
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="url_shop"
										checked={this.state.data.excludes.indexOf('url_shop') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									url_shop
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="legal_info"
										checked={this.state.data.excludes.indexOf('legal_info') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									legal_info
								</label>
							</div>
						</div>
						<div className="col-sm-6">
							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="logo_tag"
										checked={this.state.data.excludes.indexOf('logo_tag') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									logo
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="startprice"
										checked={this.state.data.excludes.indexOf('startprice') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									startprice
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="price2"
										checked={this.state.data.excludes.indexOf('price2') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									param name="price2"
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="bannerskidka"
										checked={this.state.data.excludes.indexOf('bannerskidka') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									param name="bannerskidka"
								</label>
							</div>

							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="logo"
										checked={this.state.data.excludes.indexOf('logo') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									param name="logo"
								</label>
							</div>
						</div>
					</div>
				</div>

				<div className="col-sm-12">
					<div className="h2">3. Что пишем в ссылки</div>
					<div className="form-horizontal">
						<div className="form-group">
							<label className="col-sm-2 control-label">url</label>
							<div className="col-sm-10">
								<select
									className="form-control"
									value={this.state.data.bindUrl}
									disabled={this.state.isLoading}
									onChange={this.handleChangeBindUrl}
									>
									<option value="url">url товара на сайте мерчанта</option>
									<option value="url_cat">url категории на cmonday</option>
									<option value="url_shop">url мерчанта на cmonday</option>
								</select>
							</div>
						</div>
						<div className="form-group">
							<label className="col-sm-2 control-label">url_cat</label>
							<div className="col-sm-10">
								<select
									className="form-control"
									value={this.state.data.bindUrlCat}
									disabled={this.state.isLoading}
									onChange={this.handleChangeBindUrlCat}
									>
									<option value="url">url товара на сайте мерчанта</option>
									<option value="url_cat">url категории на cmonday</option>
									<option value="url_shop">url мерчанта на cmonday</option>
								</select>
							</div>
						</div>
						<div className="form-group">
							<label className="col-sm-2 control-label">url_shop</label>
							<div className="col-sm-10">
								<select
									className="form-control"
									value={this.state.data.bindUrlShop}
									disabled={this.state.isLoading}
									onChange={this.handleChangeBindUrlShop}
									>
									<option value="url">url товара на сайте мерчанта</option>
									<option value="url_cat">url категории на cmonday</option>
									<option value="url_shop">url мерчанта на cmonday</option>
								</select>
							</div>
						</div>
					</div>
				</div>

				<div className="col-sm-12">
					<div className="h2">4. UTM метки</div>
					<div className="row">
						<div className="col-sm-4">
							<div className="form-group">
								<label htmlFor="feed-maker-utm-source">utm_source</label>
								<input
									type="text"
									className="form-control"
									id="feed-maker-utm-source"
									value={this.state.data.utmSource}
									disabled={this.state.isLoading}
									onChange={this.handleChangeUtmSource}
									/>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="form-group">
								<label htmlFor="feed-maker-utm-medium">utm_medium</label>
								<input
									type="text"
									className="form-control"
									id="feed-maker-utm-medium"
									value={this.state.data.utmMedium}
									disabled={this.state.isLoading}
									onChange={this.handleChangeUtmMedium}
									/>
							</div>
						</div>
						<div className="col-sm-4">
							<div className="form-group">
								<label htmlFor="feed-maker-utm-campaign">utm_campaign</label>
								<input
									type="text"
									className="form-control"
									id="feed-maker-utm-campaign"
									value={this.state.data.utmCampaign}
									disabled={this.state.isLoading}
									onChange={this.handleChangeUtmCampaign}
									/>
							</div>
						</div>
					</div>
				</div>

				<div className="col-sm-12">
					<div className="h2">5. Выделять товары на главной в отдельную категорию</div>
					<div className="checkbox">
						<label>
							<input
								type="checkbox"
								checked={this.state.data.showTeaserCat}
								disabled={this.state.isLoading}
								onChange={this.handleChangeShowTeaserCat}
								/>
							Да
						</label>
					</div>
				</div>

				<div className="col-sm-12 text-center">
					<a href={this.state.link} className="btn btn-primary" download>
						Сгенерировать файл
					</a>
				</div>
			</div>
		);
	}
});

export default FeedMaker;
