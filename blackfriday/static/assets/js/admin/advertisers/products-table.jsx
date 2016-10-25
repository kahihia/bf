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
import ProductsTableHelpIcon from './products-table-help-icon.jsx';

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

	collectLimits() {
		const {limits} = this.props;
		const {products} = this.state;
		let isTeaser = limits.teasers || 0;
		let isTeaserOnMain = limits.teasers_on_main || 0;

		products.forEach(product => {
			if (product.isTeaser) {
				isTeaser -= 1;
			}
			if (product.isTeaserOnMain) {
				isTeaserOnMain -= 1;
			}
		});

		return {
			isTeaser,
			isTeaserOnMain
		};
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
			categoriesAvailable,
			limits
		} = this.props;
		const isAllSelected = this.isAllSelected();
		const isAnySelected = this.isAnySelected();
		const isWaiting = isLoading || Boolean(queue);

		const categoriesAvailableOptions = categoriesAvailable.reduce((a, b) => {
			a[b.name] = b.name;
			return a;
		}, {none: ''});

		const limitsAvailable = this.collectLimits();
		const showIsTeaser = Boolean(limits.teasers);
		const showIsTeaserOnMain = Boolean(limits.teasers_on_main);

		return (
			<IsLoadingWrapper isLoading={isWaiting}>
				<CategoryChanger
					categoriesAvailable={categoriesAvailableOptions}
					onChange={this.handleChangeGroupCategory}
					disabled={!isAnySelected}
					/>

				<table className={'table table-bordered table-hover ' + b(className, 'table')}>
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
									<ProductsTableHelpIcon name="name"/>

									{FEED_CELL.name}
								</SortHeaderCell>
							</th>

							<th className={b(className, 'table-th', {name: 'oldprice'})}>
								<span>
									<ProductsTableHelpIcon name="oldprice"/>

									{FEED_CELL.oldPrice}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'price'})}>
								<span>
									{FEED_CELL.price}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'startprice'})}>
								<span>
									<ProductsTableHelpIcon name="startprice"/>

									{FEED_CELL.startPrice}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'discount'})}>
								<span>
									<ProductsTableHelpIcon name="discount"/>

									{FEED_CELL.discount}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'country'})}>
								<span>
									<ProductsTableHelpIcon name="country"/>

									{FEED_CELL.country}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'brand'})}>
								<span>
									<ProductsTableHelpIcon name="brand"/>

									{FEED_CELL.brand}
								</span>
							</th>

							{showIsTeaser ? (
								<th className={b(className, 'table-th', {name: 'teaser'})}>
									<span>
										{FEED_CELL.teaser}
									</span>
								</th>
							) : null}

							{showIsTeaserOnMain ? (
								<th className={b(className, 'table-th', {name: 'teaser-on-main'})}>
									<span>
										{FEED_CELL.teaserOnMain}
									</span>
								</th>
							) : null}

							<th className={b(className, 'table-th', {name: 'category'})}>
								<span>
									<ProductsTableHelpIcon name="category"/>

									{FEED_CELL.category}
								</span>
							</th>

							<th className={b(className, 'table-th', {name: 'image'})}>
								<span>
									<ProductsTableHelpIcon name="image"/>

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
								categoriesAvailable={categoriesAvailableOptions}
								onSelect={this.handleSelectProduct}
								onChange={this.handleChangeProduct}
								limits={limitsAvailable}
								{...{
									showIsTeaser,
									showIsTeaserOnMain
								}}
								/>
						))}
					</tbody>
				</table>
			</IsLoadingWrapper>
		);
	}
}
ProductsTable.propTypes = {
	categoriesAvailable: React.PropTypes.array,
	limits: React.PropTypes.object,
	merchantId: React.PropTypes.number,
	products: React.PropTypes.array
};
ProductsTable.defaultProps = {
	categoriesAvailable: []
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
		const previousProps = this.props;
		const previousState = this.state;

		if (JSON.stringify(previousState.errors) !== JSON.stringify(nextState.errors)) {
			isChanged = true;
		}

		if (JSON.stringify(previousState.warnings) !== JSON.stringify(nextState.warnings)) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.categoriesAvailable, nextProps.categoriesAvailable)) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.errors, nextProps.errors)) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.warnings, nextProps.warnings)) {
			isChanged = true;
		}

		if (previousProps.isSelected !== nextProps.isSelected) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.data, nextProps.data)) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.data.category, nextProps.data.category)) {
			isChanged = true;
		}

		if (!_.isEqual(previousProps.limits, nextProps.limits)) {
			isChanged = true;
		}

		if (previousProps.showIsTeaser !== nextProps.showIsTeaser) {
			isChanged = true;
		}

		if (previousProps.showIsTeaserOnMain !== nextProps.showIsTeaserOnMain) {
			isChanged = true;
		}

		return isChanged;
	}

	handleSelect() {
		this.props.onSelect(this.props.id, !this.props.isSelected);
	}

	handleChangeCell(values) {
		const firstValueName = values[0].name;
		if (firstValueName === 'price' || firstValueName === 'oldPrice') {
			values.push({
				name: 'startPrice',
				value: null
			});
			values.push({
				name: 'discount',
				value: null
			});
		} else if (firstValueName === 'startPrice') {
			values.push({
				name: 'oldPrice',
				value: null
			});
			values.push({
				name: 'price',
				value: null
			});
			values.push({
				name: 'discount',
				value: null
			});
		} else if (firstValueName === 'discount') {
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
		const {
			errors,
			warnings
		} = this.state;
		const {
			categoriesAvailable,
			data,
			isSelected,
			limits,
			showIsTeaser,
			showIsTeaserOnMain
		} = this.props;

		const disabledIsTeaser = limits.isTeaser === 0 && !data.isTeaser;
		const disabledIsTeaserOnMain = limits.isTeaserOnMain === 0 && !data.isTeaserOnMain;

		const {
			oldPrice,
			price,
			startPrice,
			discount
		} = data;
		let isOldPriceAvailable = true;
		let isPriceAvailable = true;
		let isStartPriceAvailable = true;
		let isDiscountAvailable = true;
		if (price || price === 0 || oldPrice || oldPrice === 0) {
			isStartPriceAvailable = false;
			isDiscountAvailable = false;
		} else if (startPrice || startPrice === 0) {
			isOldPriceAvailable = false;
			isPriceAvailable = false;
			isDiscountAvailable = false;
		} else if (discount || discount === 0) {
			isOldPriceAvailable = false;
			isPriceAvailable = false;
			isStartPriceAvailable = false;
		}

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
					names={['oldPrice']}
					errors={errors}
					warnings={warnings}
					disabled={!isOldPriceAvailable}
					>
					{isOldPriceAvailable ? (
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
					) : null}
				</ProductsTableCell>

				<ProductsTableCell
					names={['price']}
					errors={errors}
					warnings={warnings}
					disabled={!isPriceAvailable}
					>
					{isPriceAvailable ? (
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
					) : null}
				</ProductsTableCell>

				<ProductsTableCell
					names={['startPrice']}
					errors={errors}
					warnings={warnings}
					disabled={!isStartPriceAvailable}
					>
					{isStartPriceAvailable ? (
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
					) : null}
				</ProductsTableCell>

				<ProductsTableCell
					names={['discount']}
					errors={errors}
					warnings={warnings}
					disabled={!isDiscountAvailable}
					>
					{isDiscountAvailable ? (
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
					) : null}
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

				{showIsTeaser ? (
					<td className={b(className, 'table-td', {name: 'teaser'})}>
						<input
							type="checkbox"
							name="isTeaser"
							checked={data.isTeaser}
							onChange={this.handleChangeTeaser}
							disabled={disabledIsTeaser}
							/>
					</td>
				) : null}

				{showIsTeaserOnMain ? (
					<td className={b(className, 'table-td', {name: 'teaser-on-main'})}>
						<input
							type="checkbox"
							name="isTeaserOnMain"
							checked={data.isTeaserOnMain}
							onChange={this.handleChangeTeaserOnMain}
							disabled={disabledIsTeaserOnMain}
							/>
					</td>
				) : null}

				<ProductsTableCell
					names={['category']}
					errors={errors}
					warnings={warnings}
					>
					<Select
						options={categoriesAvailable}
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
	categoriesAvailable: React.PropTypes.object,
	data: React.PropTypes.object.isRequired,
	errors: React.PropTypes.array,
	id: React.PropTypes.number.isRequired,
	isSelected: React.PropTypes.bool,
	limits: React.PropTypes.object,
	onChange: React.PropTypes.func.isRequired,
	onSelect: React.PropTypes.func.isRequired,
	showIsTeaser: React.PropTypes.bool,
	showIsTeaserOnMain: React.PropTypes.bool,
	warnings: React.PropTypes.array
};
ProductsTableRow.defaultProps = {
	isSelected: false
};

const CategoryChanger = React.createClass({
	propTypes: {
		categoriesAvailable: React.PropTypes.object.isRequired,
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
			const firstCategory = newProps.categoriesAvailable[0];
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
			categoriesAvailable,
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
						options={categoriesAvailable}
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
