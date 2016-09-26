/* global window, toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import ApiToggler from 'api-toggler';
import {formatPrice} from '../utils.js';
import {SORT_TYPES} from '../const.js';
import Select from '../components/select.jsx';
import SortHeaderCell from '../components/sort-header-cell.jsx';
import {getLimit} from './limits.js';
import EditableCell from './editable-cell.jsx';
import {renderGoodsCounter} from './goods-counter.jsx';
import getCategories from './categories.js';

const ShopGoodsControl = React.createClass({
	getInitialState() {
		return {
			allowedCategories: [],
			goods: [],
			colSortDirs: {},
			queue: 0
		};
	},

	componentWillMount() {
		this.apiToggler = new ApiToggler({
			vendor: 'brand',
			category: 'cat_name',
			categoryId: 'cat_id',
			countryoforigin: 'country',
			image1: 'image_url',
			image2: 'image2_url',
			image3: 'image3_url',
			oldprice: 'price_old',
			startprice: 'start_price',
			isTeaser: 'teaser',
			isTeaserAtMain: 'teaser_on_main'
		});

		this.requestCategories();
		this.requestExistsGoods();
	},

	requestCategories() {
		getCategories(allowedCategories => {
			this.setState({
				allowedCategories: allowedCategories.map(category => {
					return {
						name: category.name,
						id: category.id
					};
				})
			});
		});
	},

	handleSelectGood(goodId, isChecked) {
		this.getGoodById(goodId).isSelected = isChecked;
		this.forceUpdate();
	},

	handleChangeGoodTeaser(goodId, isChecked) {
		if (isChecked && !this.isTeaserAllowed()) {
			toastr.warning(`Всего доступно ${getLimit('teaser') + getLimit('additional_teaser')}`);
			return;
		}
		this.requestChangeGoodTeaser(goodId, isChecked);
	},

	handleChangeGoodTeaserAtMain(goodId, isChecked) {
		if (isChecked && !this.isTeaserAtMainAllowed()) {
			toastr.warning(`Всего доступно ${getLimit('teaser_on_main')}`);
			return;
		}
		this.requestChangeGoodTeaserAtMain(goodId, isChecked);
	},

	handleSelectAllGoods() {
		const isAllSelected = !this.isAllSelected();
		this.state.goods.forEach(good => {
			good.isSelected = isAllSelected;
		});
		this.forceUpdate();
	},

	handleSortChange(columnKey, sortDir) {
		const goods = this.state.goods;

		goods.sort((indexA, indexB) => {
			var valueA = indexA[columnKey];
			var valueB = indexB[columnKey];
			var sortVal = 0;
			if (valueA > valueB) {
				sortVal = 1;
			}
			if (valueA < valueB) {
				sortVal = -1;
			}
			if (sortVal !== 0 && sortDir === SORT_TYPES.ASC) {
				sortVal *= -1;
			}

			return sortVal;
		});

		this.setState({
			goods: goods,
			colSortDirs: {
				[columnKey]: sortDir
			}
		});
	},

	handleChangeGood(goodId, goodData) {
		this.requestChangeGood(goodId, goodData);
	},

	requestExistsGoods() {
		xhr({
			url: `/feeds/merchant/${window.itemId}/goods`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data) {
					const goods = this.apiToggler.toggle(data);
					goods.forEach(good => {
						good.isTeaser = Boolean(good.isTeaser);
					});
					this.setState({goods: goods});
					renderGoodsCounter({count: goods.length});
				}
			}
		});
	},

	requestChangeGood(goodId, goodData) {
		window.confirmModerationWarning().then(() => {
			const changedData = goodData.reduce((a, b) => {
				a[b.name] = b.value;
				return a;
			}, {});

			xhr({
				url: `/admin/good/${goodId}`,
				method: 'PUT',
				json: this.apiToggler.toggle(changedData)
			}, (err, resp) => {
				if (!err && resp.statusCode === 200) {
					toastr.success('Настройки сохранены');
					_.merge(this.getGoodById(goodId), changedData);
					this.forceUpdate();
				} else {
					toastr.error('Не удалось обновить товар');
				}
			});
		});
	},

	requestChangeGoodsCategories(goodIds, categoryId) {
		window.confirmModerationWarning().then(() => {
			this.setState({
				queue: goodIds.length
			}, () => {
				goodIds.forEach(goodId => {
					this.requestChangeGoodCategory(goodId, categoryId);
				});
			});
		});
	},

	requestChangeGoodCategory(goodId, categoryId) {
		xhr({
			url: `/admin/good/${goodId}`,
			method: 'PUT',
			json: this.apiToggler.toggle({categoryId})
		}, (err, resp) => {
			const queue = this.state.queue - 1;

			this.setState({
				queue: queue
			}, () => {
				const good = this.getGoodById(goodId);

				if (!err && resp.statusCode === 200) {
					good.categoryId = categoryId;
					good.isSelected = false;
				}

				if (!this.state.queue) {
					if (!err && resp.statusCode === 200) {
						toastr.success('Настройки сохранены');
					} else {
						toastr.error(`Не удалось обновить товар ${good.id} "${good.name}"`);
					}

					this.forceUpdate();
				}
			});
		});
	},

	requestChangeGoodTeaser(goodId, isChecked) {
		window.confirmModerationWarning().then(() => {
			xhr({
				url: `/admin/good/${goodId}`,
				method: 'PUT',
				body: `${this.apiToggler.toggle('isTeaser')}=${isChecked ? 1 : 0}`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}, (err, resp) => {
				if (!err && resp.statusCode === 200) {
					toastr.success('Настройки сохранены');
					this.getGoodById(goodId).isTeaser = isChecked;
					this.forceUpdate();
				} else {
					toastr.error('Не удалось обновить настройки');
				}
			});
		});
	},

	requestChangeGoodTeaserAtMain(goodId, isChecked) {
		window.confirmModerationWarning().then(() => {
			xhr({
				url: `/admin/good/${goodId}`,
				method: 'PUT',
				body: `${this.apiToggler.toggle('isTeaserAtMain')}=${isChecked ? 1 : 0}`,
				headers: {
					'Content-Type': 'application/x-www-form-urlencoded'
				}
			}, (err, resp) => {
				if (!err && resp.statusCode === 200) {
					toastr.success('Настройки сохранены');
					this.getGoodById(goodId).isTeaserAtMain = isChecked;
					this.forceUpdate();
				} else {
					toastr.error('Не удалось обновить настройки');
				}
			});
		});
	},

	getGoodById(goodId) {
		return _.find(this.state.goods, {id: goodId});
	},

	getSelectedGoods() {
		return _.filter(this.state.goods, {isSelected: true});
	},

	isAllSelected() {
		const isFalse = Boolean(this.state.goods.filter(good => {
			return !good.isSelected;
		}).length);
		return !isFalse;
	},

	isAnySelected() {
		return Boolean(_.find(this.state.goods, {isSelected: true}));
	},

	isTeaserAllowed() {
		const teasers = this.state.goods.filter(good => {
			return good.isTeaser;
		});

		return teasers.length < (getLimit('teaser') + getLimit('additional_teaser'));
	},

	isTeaserAtMainAllowed() {
		const teasers = this.state.goods.filter(good => {
			return good.isTeaserAtMain;
		});

		return teasers.length < getLimit('teaser_on_main');
	},

	handleGroupCategoryChange(categoryId) {
		const selectedGoods = this.state.goods.reduce((a, b) => {
			if (b.isSelected) {
				a.push(b.id);
			}
			return a;
		}, []);

		this.requestChangeGoodsCategories(selectedGoods, categoryId);
	},

	render() {
		const isAllSelected = this.isAllSelected();
		const isAnySelected = this.isAnySelected();

		return (
			<div className="goods-control">
				{this.state.queue ? (
					<div className="goods-control__disabled"/>
				) : null}

				<CategoryChanger
					allowedCategories={this.state.allowedCategories}
					onChange={this.handleGroupCategoryChange}
					disabled={!isAnySelected}
					/>

				<table className="goods-table table">
					<thead>
						<tr>
							<th>
								<span>
									<input
										type="checkbox"
										checked={isAllSelected}
										onChange={this.handleSelectAllGoods}
										/>
								</span>
							</th>
							<th>
								<SortHeaderCell
									onSortChange={this.handleSortChange}
									columnKey="name"
									sortDir={this.state.colSortDirs.name}
									>
									{'Название'}
								</SortHeaderCell>
							</th>
							<th>
								<span>
									{'Описание'}
								</span>
							</th>
							<th>
								<span>
									{'Цена от'}
								</span>
							</th>
							<th>
								<span>
									{'Старая цена'}
								</span>
							</th>
							<th>
								<span>
									{'Цена'}
								</span>
							</th>
							<th>
								<span>
									{'Скидка'}
								</span>
							</th>
							<th>
								<span>
									{'Страна производства'}
								</span>
							</th>
							<th>
								<span>
									{'Товар на главной'}
								</span>
							</th>
							<th>
								<span>
									{'Тизер на первом экране'}
								</span>
							</th>
							<th>
								<span>
									{'Категория'}
								</span>
							</th>
							<th>
								<span>
									{'Картинка'}
								</span>
							</th>
						</tr>
					</thead>

					<tbody>
						{this.state.goods.map(good => {
							return (
								<GoodsTableRow
									key={good.id}
									id={good.id}
									data={good}
									allowedCategories={this.state.allowedCategories}
									isSelected={good.isSelected}
									onSelect={this.handleSelectGood}
									onChange={this.handleChangeGood}
									onChangeTeaser={this.handleChangeGoodTeaser}
									onChangeTeaserAtMain={this.handleChangeGoodTeaserAtMain}
									/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

export default ShopGoodsControl;

const GoodsTableRow = React.createClass({
	propTypes: {
		id: React.PropTypes.number.isRequired,
		data: React.PropTypes.object.isRequired,
		allowedCategories: React.PropTypes.array.isRequired,
		isSelected: React.PropTypes.bool,
		onSelect: React.PropTypes.func.isRequired,
		onChange: React.PropTypes.func.isRequired,
		onChangeTeaser: React.PropTypes.func.isRequired,
		onChangeTeaserAtMain: React.PropTypes.func.isRequired
	},

	getDefaultProps() {
		return {};
	},

	handleSelect() {
		this.props.onSelect(this.props.id, !this.props.isSelected);
	},

	handleCellChange(values) {
		const firstValueName = values[0].name;
		if (firstValueName === 'discount') {
			values.push({
				name: 'oldprice',
				value: null
			});
			values.push({
				name: 'price',
				value: null
			});
			values.push({
				name: 'startprice',
				value: false
			});
		} else if (firstValueName === 'oldprice' || firstValueName === 'price') {
			values.push({
				name: 'discount',
				value: null
			});
		}

		this.props.onChange(this.props.id, values);
	},

	handleChangeTeaser() {
		this.props.onChangeTeaser(this.props.id, !this.props.data.isTeaser);
	},

	handleChangeTeaserAtMain() {
		this.props.onChangeTeaserAtMain(this.props.id, !this.props.data.isTeaserAtMain);
	},

	handleChangeCategory(value) {
		this.props.onChange(this.props.id, [{
			name: 'categoryId',
			value: value
		}]);
	},

	handleChangeStartprice() {
		this.props.onChange(this.props.id, [{
			name: 'startprice',
			value: !this.props.data.startprice
		}]);
	},

	render() {
		const data = this.props.data;

		return (
			<tr>
				<td>
					<input
						type="checkbox"
						checked={this.props.isSelected}
						onChange={this.handleSelect}
						/>
				</td>
				<td>
					<EditableCell
						values={[
							{
								name: 'name',
								value: data.name
							},
							{
								name: 'url',
								value: data.url
							}
						]}
						onChange={this.handleCellChange}
						>
						<a
							href={data.url}
							target="_blank"
							rel="noopener noreferrer"
							>
							{data.name}
						</a>
					</EditableCell>
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'description',
							value: data.description,
							type: 'textarea'
						}]}
						onChange={this.handleCellChange}
						>
						{data.description}
					</EditableCell>
				</td>
				<td>
					{(data.price || data.price === 0) && (data.oldprice || data.oldprice === 0) ? (
						<input
							type="checkbox"
							onChange={this.handleChangeStartprice}
							checked={data.startprice}
							/>
					) : null}
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'oldprice',
							value: data.oldprice
						}]}
						onChange={this.handleCellChange}
						>
						{data.startprice ? 'от ' : null}
						{data.oldprice || data.oldprice === 0 ? (
							<Price
								cost={formatPrice(data.oldprice)}
								type="old"
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'price',
							value: data.price
						}]}
						onChange={this.handleCellChange}
						>
						{data.startprice ? 'от ' : null}
						{data.price || data.price === 0 ? (
							<strong>
								<Price
									cost={formatPrice(data.price)}
									currency="₽"
									/>
							</strong>
						) : null}
					</EditableCell>
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'discount',
							value: data.discount
						}]}
						onChange={this.handleCellChange}
						>
						<strong>
							{data.discount}
						</strong>
						{data.discount ? ' %' : null}
					</EditableCell>
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'countryoforigin',
							value: data.countryoforigin
						}]}
						onChange={this.handleCellChange}
						>
						{data.countryoforigin}
					</EditableCell>
				</td>
				<td>
					<input
						type="checkbox"
						name="teaser"
						checked={data.isTeaser}
						onChange={this.handleChangeTeaser}
						/>
				</td>
				<td>
					<input
						type="checkbox"
						name="teaser_on_main"
						checked={data.isTeaserAtMain}
						onChange={this.handleChangeTeaserAtMain}
						/>
				</td>
				<td>
					<Select
						options={this.props.allowedCategories}
						selected={data.categoryId}
						onChange={this.handleChangeCategory}
						/>
				</td>
				<td>
					<EditableCell
						values={[
							{
								name: 'image1',
								value: data.image1
							},
							{
								name: 'image2',
								value: data.image2
							},
							{
								name: 'image3',
								value: data.image3
							}
						]}
						onChange={this.handleCellChange}
						>
						{data.image1 ? (
							<img
								src={data.image1}
								className="img-thumbnail"
								alt=""
								width="50"
								height="50"
								/>
						) : null}
						{data.image2 ? (
							<img
								src={data.image2}
								className="img-thumbnail"
								alt=""
								width="50"
								height="50"
								/>
						) : null}
						{data.image3 ? (
							<img
								src={data.image3}
								className="img-thumbnail"
								alt=""
								width="50"
								height="50"
								/>
						) : null}
					</EditableCell>
				</td>
			</tr>
		);
	}
});

const CategoryChanger = React.createClass({
	propTypes: {
		allowedCategories: React.PropTypes.array.isRequired,
		onChange: React.PropTypes.func.isRequired,
		disabled: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			disabled: true
		};
	},

	getInitialState() {
		return {
			categoryId: null
		};
	},

	componentWillReceiveProps(newProps) {
		if (this.state.categoryId === null) {
			const firstCategory = newProps.allowedCategories[0];
			if (firstCategory) {
				this.setState({categoryId: firstCategory.id});
			}
		}
	},

	handleChangeCategory(categoryId) {
		this.setState({categoryId});
	},

	handleClickChange() {
		this.props.onChange(this.state.categoryId);
	},

	render() {
		const {disabled} = this.props;

		return (
			<div className="form-inline">
				<div
					className="form-group"
					style={{paddingTop: 7}}
					>
					<span
						className="control-label"
						style={{marginRight: 5}}
						>
						Изменить категорию для выбранных товаров
					</span>

					<Select
						className="form-control"
						style={{marginRight: 5}}
						options={this.props.allowedCategories}
						selected={this.state.categoryId}
						onChange={this.handleChangeCategory}
						disabled={disabled}
						/>

					<button
						onClick={this.handleClickChange}
						className="btn btn-primary"
						type="button"
						disabled={disabled}
						>
						Изменить
					</button>
				</div>
			</div>
		);
	}
});
