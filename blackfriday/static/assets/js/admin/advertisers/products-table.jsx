/* global toastr _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import b from 'b_';
import {FEED_CELL, TOKEN, SORT_TYPES} from '../const.js';
import {formatPrice} from '../utils.js';
import Select from '../components/select.jsx';
import SortHeaderCell from '../components/sort-header-cell.jsx';
import EditableCell from './editable-cell.jsx';
import ProductsTableCell from './products-table-cell.jsx';
import IsLoadingWrapper from '../components/is-loading-wrapper.jsx';

const className = 'products-table';

class ProductsTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			colSortDirs: {},
			isLoading: false,
			products: props.products,
			errors: {},
			warnings: {},
			queue: 0
		};

		this.handleSelectAllProducts = this.handleSelectAllProducts.bind(this);
		this.handleSortChange = this.handleSortChange.bind(this);
		this.handleSelectProduct = this.handleSelectProduct.bind(this);
		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleChangeGroupCategory = this.handleChangeGroupCategory.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({products: newProps.products});
	}

	handleSelectAllProducts() {
		const isAllSelected = !this.isAllSelected();
		this.state.products.forEach(product => {
			product.isSelected = isAllSelected;
		});
		this.forceUpdate();
	}

	handleSortChange(columnKey, sortDir) {
		const {products} = this.state;

		products.sort((indexA, indexB) => {
			const valueA = indexA[columnKey];
			const valueB = indexB[columnKey];
			let sortVal = 0;
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
			colSortDirs: {
				[columnKey]: sortDir
			},
			products
		});
	}

	handleSelectProduct(productId, isSelected) {
		this.getProductById(productId).isSelected = isSelected;
		this.forceUpdate();
	}

	handleChangeProduct(productId, productData) {
		this.requestChangeProduct(productId, productData);
	}

	handleChangeGroupCategory(categoryName) {
		const selectedProducts = this.state.products.reduce((a, b) => {
			if (b.isSelected) {
				a.push(b.id);
			}
			return a;
		}, []);

		this.requestChangeGroupCategory(selectedProducts, categoryName);
	}

	requestChangeProduct(productId, productData) {
		if (!this.state.isLoading) {
			this.setState({isLoading: true});
		}

		const item = this.getProductById(productId);
		const reducedProduct = _.pick(item, [
			'name',
			'image',
			'price',
			'startPrice',
			'oldPrice',
			'discount',
			'country',
			'brand',
			'url',
			'currency',
			'isTeaser',
			'isTeaserOnMain'
		]);
		reducedProduct.category = item.category.name;
		reducedProduct.currency = 'rur';
		productData.forEach(data => {
			reducedProduct[data.name] = data.value;
		});
		for (let key in reducedProduct) {
			if (reducedProduct[key] === '') {
				reducedProduct[key] = null;
			}
		}

		const {merchantId} = this.props;
		const json = reducedProduct;

		xhr({
			url: `/api/merchants/${merchantId}/products/${productId}/`,
			method: 'PUT',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			const {queue} = this.state;
			const newQueue = queue ? queue - 1 : queue;

			this.setState({
				isLoading: false,
				queue: newQueue
			});

			switch (resp.statusCode) {
				case 200: {
					this.productUpdate(data, Boolean(newQueue));
					break;
				}
				case 400: {
					this.productUpdateErrors(productId, data, reducedProduct, Boolean(newQueue));
					break;
				}
				default: {
					toastr.error('Не удалось обновить товар');
					break;
				}
			}
		});
	}

	requestChangeGroupCategory(productIds, categoryName) {
		this.setState({
			queue: productIds.length
		}, () => {
			productIds.forEach(productId => {
				this.requestChangeProduct(productId, [{
					name: 'category',
					value: categoryName
				}]);
			});
		});
	}

	getProductById(id) {
		return _.find(this.state.products, {id});
	}

	productUpdate(product, silent) {
		const {
			products,
			errors,
			warnings
		} = this.state;

		const item = _.find(products, {id: product.id});
		const index = _.findIndex(products, item);
		products.splice(index, 1, product);

		errors[product.id] = null;
		warnings[product.id] = null;

		if (silent) {
			return;
		}
		this.forceUpdate();
	}

	productUpdateErrors(productId, data, productsChanged, silent) {
		const {
			products,
			errors,
			warnings
		} = this.state;

		const item = _.find(products, {id: productId});
		_.forEach(item, (i, k) => {
			if (k === 'id') {
				return;
			}
			if (k === 'category') {
				item[k].name = productsChanged[k];
				return;
			}
			item[k] = productsChanged[k];
		});

		errors[productId] = data.errors;
		warnings[productId] = data.warnings;

		if (silent) {
			return;
		}
		this.forceUpdate();
	}

	isAllSelected() {
		const isFalse = Boolean(this.state.products.filter(product => !product.isSelected).length);
		return !isFalse;
	}

	isAnySelected() {
		return Boolean(_.find(this.state.products, {isSelected: true}));
	}

	render() {
		const {
			colSortDirs,
			errors,
			isLoading,
			products,
			queue,
			warnings
		} = this.state;
		const {
			availableCategories
		} = this.props;
		const isAllSelected = this.isAllSelected();
		const isAnySelected = this.isAnySelected();
		const isWaiting = isLoading || Boolean(queue);

		const availableCategoryOptions = availableCategories.reduce((a, b) => {
			a[b.name] = b.name;
			return a;
		}, {none: ''});

		return (
			<IsLoadingWrapper isLoading={isWaiting}>
				<CategoryChanger
					availableCategories={availableCategoryOptions}
					onChange={this.handleChangeGroupCategory}
					disabled={!isAnySelected}
					/>

				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'select'})}>
								<span>
									<input
										type="checkbox"
										checked={isAllSelected}
										onChange={this.handleSelectAllProducts}
										/>
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								<SortHeaderCell
									onSortChange={this.handleSortChange}
									columnKey="name"
									sortDir={colSortDirs.name}
									>
									{FEED_CELL.name}
								</SortHeaderCell>
							</th>

							<th className={b(className, 'table-th', {name: 'startprice'})}>
								<span>
									{FEED_CELL.startPrice}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'oldprice'})}>
								<span>
									{FEED_CELL.oldPrice}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'price'})}>
								<span>
									{FEED_CELL.price}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'discount'})}>
								<span>
									{FEED_CELL.discount}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'country'})}>
								<span>
									{FEED_CELL.country}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'brand'})}>
								<span>
									{FEED_CELL.brand}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'teaser'})}>
								<span>
									{FEED_CELL.teaser}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'teaser-on-main'})}>
								<span>
									{FEED_CELL.teaserOnMain}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'category'})}>
								<span>
									{FEED_CELL.category}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'image'})}>
								<span>
									{FEED_CELL.image}
								</span>
							</th>
						</tr>
					</thead>

					<tbody>
						{products.map(product => (
							<ProductsTableRow
								key={product.id}
								id={product.id}
								data={product}
								errors={errors[product.id]}
								warnings={warnings[product.id]}
								isSelected={product.isSelected}
								availableCategories={availableCategoryOptions}
								onSelect={this.handleSelectProduct}
								onChange={this.handleChangeProduct}
								/>
						))}
					</tbody>
				</table>
			</IsLoadingWrapper>
		);
	}
}
ProductsTable.propTypes = {
	availableCategories: React.PropTypes.array,
	merchantId: React.PropTypes.number,
	products: React.PropTypes.array
};
ProductsTable.defaultProps = {
	availableCategories: []
};

export default ProductsTable;

class ProductsTableRow extends React.Component {
	constructor(props) {
		super(props);
		const {errors, warnings} = props;
		this.state = {
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		};

		this.handleSelect = this.handleSelect.bind(this);
		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
		this.handleChangeTeaser = this.handleChangeTeaser.bind(this);
		this.handleChangeTeaserOnMain = this.handleChangeTeaserOnMain.bind(this);
	}

	componentWillReceiveProps(newProps) {
		const {errors, warnings} = newProps;
		this.setState({
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		});
	}

	shouldComponentUpdate(nextProps, nextState) {
		let isChanged = false;

		if (JSON.stringify(this.state.errors) !== JSON.stringify(nextState.errors)) {
			isChanged = true;
		}

		if (JSON.stringify(this.state.warnings) !== JSON.stringify(nextState.warnings)) {
			isChanged = true;
		}

		if (!_.isEqual(this.props.availableCategories, nextProps.availableCategories)) {
			isChanged = true;
		}

		if (!_.isEqual(this.props.errors, nextProps.errors)) {
			isChanged = true;
		}

		if (!_.isEqual(this.props.warnings, nextProps.warnings)) {
			isChanged = true;
		}

		if (this.props.isSelected !== nextProps.isSelected) {
			isChanged = true;
		}

		if (!_.isEqual(this.props.data, nextProps.data)) {
			isChanged = true;
		}

		if (!_.isEqual(this.props.data.category, nextProps.data.category)) {
			isChanged = true;
		}

		return isChanged;
	}

	handleSelect() {
		this.props.onSelect(this.props.id, !this.props.isSelected);
	}

	handleChangeCell(values) {
		const firstValueName = values[0].name;
		if (firstValueName === 'discount') {
			values.push({
				name: 'oldPrice',
				value: null
			});
			values.push({
				name: 'price',
				value: null
			});
			values.push({
				name: 'startPrice',
				value: null
			});
		} else if (firstValueName === 'oldPrice' || firstValueName === 'price') {
			values.push({
				name: 'discount',
				value: null
			});
		}

		this.props.onChange(this.props.id, values);
	}

	handleChangeCategory(value) {
		this.props.onChange(this.props.id, [{
			name: 'category',
			value
		}]);
	}

	handleChangeTeaser() {
		this.props.onChange(this.props.id, [{
			name: 'isTeaser',
			value: !this.props.data.isTeaser
		}]);
	}

	handleChangeTeaserOnMain() {
		this.props.onChange(this.props.id, [{
			name: 'isTeaserOnMain',
			value: !this.props.data.isTeaserOnMain
		}]);
	}

	processErrors(errors) {
		if (!errors) {
			return {};
		}

		return errors.reduce((a, b) => {
			if (!a[b.field]) {
				a[b.field] = [];
			}
			a[b.field].push(b.message);

			return a;
		}, {});
	}

	render() {
		const {errors, warnings} = this.state;
		const {
			availableCategories,
			data,
			isSelected
		} = this.props;

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'select'})}>
					<input
						type="checkbox"
						checked={isSelected}
						onChange={this.handleSelect}
						/>
				</td>

				<ProductsTableCell
					names={['name', 'url']}
					errors={errors}
					warnings={warnings}
					>
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
						onChange={this.handleChangeCell}
						>
						<a
							href={data.url}
							target="_blank"
							rel="noopener noreferrer"
							>
							{data.name}
						</a>
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['startPrice']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'startPrice',
							value: data.startPrice
						}]}
						onChange={this.handleChangeCell}
						>
						{data.startPrice || data.startPrice === 0 ? (
							<Price
								cost={formatPrice(data.startPrice)}
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['oldPrice']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'oldPrice',
							value: data.oldPrice
						}]}
						onChange={this.handleChangeCell}
						>
						{data.oldPrice || data.oldPrice === 0 ? (
							<Price
								cost={formatPrice(data.oldPrice)}
								type="old"
								currency="₽"
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['price']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'price',
							value: data.price
						}]}
						onChange={this.handleChangeCell}
						>
						{data.price || data.price === 0 ? (
							<strong>
								<Price
									cost={formatPrice(data.price)}
									currency="₽"
									/>
							</strong>
						) : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['discount']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'discount',
							value: data.discount
						}]}
						onChange={this.handleChangeCell}
						>
						<strong>
							{data.discount}
						</strong>

						{data.discount ? ' %' : null}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['country']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'country',
							value: data.country
						}]}
						onChange={this.handleChangeCell}
						>
						{data.country}
					</EditableCell>
				</ProductsTableCell>

				<ProductsTableCell
					names={['brand']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[{
							name: 'brand',
							value: data.brand
						}]}
						onChange={this.handleChangeCell}
						>
						{data.brand}
					</EditableCell>
				</ProductsTableCell>

				<td className={b(className, 'table-td', {name: 'teaser'})}>
					<input
						type="checkbox"
						name="isTeaser"
						checked={data.isTeaser}
						onChange={this.handleChangeTeaser}
						/>
				</td>

				<td className={b(className, 'table-td', {name: 'teaser-on-main'})}>
					<input
						type="checkbox"
						name="isTeaserOnMain"
						checked={data.isTeaserOnMain}
						onChange={this.handleChangeTeaserOnMain}
						/>
				</td>

				<ProductsTableCell
					names={['category']}
					errors={errors}
					warnings={warnings}
					>
					<Select
						options={availableCategories}
						selected={data.category.name}
						onChange={this.handleChangeCategory}
						/>
				</ProductsTableCell>

				<ProductsTableCell
					names={['image']}
					errors={errors}
					warnings={warnings}
					>
					<EditableCell
						values={[
							{
								name: 'image',
								value: data.image
							}
						]}
						onChange={this.handleChangeCell}
						>
						{data.image ? (
							<img
								src={data.image}
								alt=""
								/>
						) : null}
					</EditableCell>
				</ProductsTableCell>
			</tr>
		);
	}
}
ProductsTableRow.propTypes = {
	availableCategories: React.PropTypes.object,
	data: React.PropTypes.object.isRequired,
	errors: React.PropTypes.array,
	id: React.PropTypes.number.isRequired,
	isSelected: React.PropTypes.bool,
	onChange: React.PropTypes.func.isRequired,
	onSelect: React.PropTypes.func.isRequired,
	warnings: React.PropTypes.array
};
ProductsTableRow.defaultProps = {
	isSelected: false
};

const CategoryChanger = React.createClass({
	propTypes: {
		availableCategories: React.PropTypes.object.isRequired,
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
			categoryId: 'none'
		};
	},

	componentWillReceiveProps(newProps) {
		if (this.state.categoryId === 'none') {
			const firstCategory = newProps.availableCategories[0];
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
		const {
			categoryId
		} = this.state;
		const {
			availableCategories,
			disabled
		} = this.props;

		return (
			<div className="form-inline category-changer">
				<div
					className="form-group"
					style={{paddingTop: 7}}
					>
					<span
						className="control-label"
						style={{marginRight: 5}}
						>
						{'Изменить категорию для выбранных товаров'}
					</span>

					<Select
						className="form-control"
						style={{marginRight: 5}}
						options={availableCategories}
						selected={categoryId}
						onChange={this.handleChangeCategory}
						disabled={disabled}
						/>

					<button
						onClick={this.handleClickChange}
						className="btn btn-primary"
						type="button"
						disabled={disabled || categoryId === 'none'}
						>
						{'Изменить'}
					</button>
				</div>
			</div>
		);
	}
});
