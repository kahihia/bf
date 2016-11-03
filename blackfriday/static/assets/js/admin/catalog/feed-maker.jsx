/* global toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import MultiselectTwoSides from 'react-multiselect-two-sides';

const FeedMaker = React.createClass({
	basePath: '/api/products/yml/',

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

		xhr.get('/api/merchants/', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({
					merchantList: data
				}, function () {
					xhr.get('/api/categories/', {json: true}, (err, resp, data) => {
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

	handleChangeMerchants(value) {
		this.setState({
			data: Object.assign({}, this.state.data, {merchants: value})
		}, this.buildLink);
	},

	handleChangeMerchantExcludes(value) {
		this.setState({
			data: Object.assign({}, this.state.data, {merchantExcludes: value})
		}, this.buildLink);
	},

	handleChangeCategories(value) {
		this.setState({
			data: Object.assign({}, this.state.data, {categories: value})
		}, this.buildLink);
	},

	handleChangeCategoryExcludes(value) {
		this.setState({
			data: Object.assign({}, this.state.data, {categoryExcludes: value})
		}, this.buildLink);
	},

	buildLink() {
		let params = {};
		let link;

		if (this.state.data.filename) {
			params.filename = this.state.data.filename;
		}

		if (this.state.data.merchants.length) {
			params.merchants = this.state.data.merchants;
		}

		if (this.state.data.categories.length) {
			params.categories = this.state.data.categories;
		}

		if (this.state.data.merchantExcludes.length) {
			params.exclude_merchants = this.state.data.merchantExcludes;
		}

		if (this.state.data.categoryExcludes.length) {
			params.exclude_categories = this.state.data.categoryExcludes;
		}

		if (this.state.data.excludes.length) {
			params.excludes = this.state.data.excludes;
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
					<div className="h2">1. Магазины и категории</div>
					<div className="row">
						<div className="col-sm-12">
							<p>
								<small className="text-muted">
									{'Обратите внимание, товары списка "исключить" имеют приоритет.'}
								</small>
							</p>
						</div>
						<div className="col-sm-6">
							<div className="h3">Включить</div>
							<div className="form-group">
								<label>Магазины</label>
								<MultiselectTwoSides
									disabled={this.state.isLoading || !this.state.merchantList.length}
									onChange={this.handleChangeMerchants}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={this.state.merchantList}
									value={this.state.data.merchants}
									labelKey="name"
									valueKey="id"
									showControls
									/>
							</div>
							<div className="form-group">
								<label>Категории</label>
								<MultiselectTwoSides
									disabled={this.state.isLoading || !this.state.categoryList.length}
									onChange={this.handleChangeCategories}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={this.state.categoryList}
									value={this.state.data.categories}
									labelKey="name"
									valueKey="id"
									showControls
									/>
							</div>
						</div>
						<div className="col-sm-6">
							<div className="h3">Исключить</div>
							<div className="form-group">
								<label>Магазины</label>
								<MultiselectTwoSides
									disabled={this.state.isLoading || !this.state.merchantList.length}
									onChange={this.handleChangeMerchantExcludes}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={this.state.merchantList}
									value={this.state.data.merchantExcludes}
									labelKey="name"
									valueKey="id"
									showControls
									/>
							</div>
							<div className="form-group">
								<label>Категории</label>
								<MultiselectTwoSides
									disabled={this.state.isLoading || !this.state.categoryList.length}
									onChange={this.handleChangeCategoryExcludes}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={this.state.categoryList}
									value={this.state.data.categoryExcludes}
									labelKey="name"
									valueKey="id"
									showControls
									/>
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
										name="url"
										checked={this.state.data.excludes.indexOf('url') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									{'<url>'}
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
									{'<url_cat>'}
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
									{'<url_shop>'}
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
									{'<legal_info>'}
								</label>
							</div>
						</div>
						<div className="col-sm-6">
							<div className="checkbox">
								<label>
									<input
										type="checkbox"
										name="logo"
										checked={this.state.data.excludes.indexOf('logo') >= 0}
										disabled={this.state.isLoading}
										onChange={this.handleChangeExcludes}
										/>
									{'<param name="logo">'}
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
									{'<param name="price2">'}
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
									{'<param name="bannerskidka">'}
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
									<option value="url">url товара на сайте магазина</option>
									<option value="url_cat">url категории на realblackfriday</option>
									<option value="url_shop">url магазина на realblackfriday</option>
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
									<option value="url">url товара на сайте магазина</option>
									<option value="url_cat">url категории на realblackfriday</option>
									<option value="url_shop">url магазина на realblackfriday</option>
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
									<option value="url">url товара на сайте магазина</option>
									<option value="url_cat">url категории на realblackfriday</option>
									<option value="url_shop">url магазина на realblackfriday</option>
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
