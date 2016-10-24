/* global toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import b from 'b_';
import {FEED_CELL, TOKEN} from '../const.js';
import {formatPrice, processErrors} from '../utils.js';
import Select from '../components/select.jsx';
import EditableCell from './editable-cell.jsx';
import ProductsTableCell from './products-table-cell.jsx';
import IsLoadingWrapper from '../components/is-loading-wrapper.jsx';

const className = 'products-table';

class ProductsNewTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			products: props.products,
			isLoading: false,
			isUploading: false,
			categoriesAvailableOptions: this.processCategoriesAvailableOptions(props.categoriesAvailable)
		};

		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleClickProductsSave = this.handleClickProductsSave.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			products: newProps.products,
			isUploading: false,
			categoriesAvailableOptions: this.processCategoriesAvailableOptions(newProps.categoriesAvailable)
		});
	}

	processCategoriesAvailableOptions(categoriesAvailable) {
		const categoriesAvailableOptions = categoriesAvailable.map(category => ({
			id: String(category.name).toLowerCase(),
			name: category.name
		}));
		categoriesAvailableOptions.unshift({
			id: '',
			name: ''
		});
		return categoriesAvailableOptions;
	}

	handleChangeProduct(productId, productData) {
		this.requestChangeProduct(productId, productData);
	}

	handleClickProductsSave() {
		this.requestProductsSave();
	}

	requestChangeProduct(productId, productData) {
		this.setState({isLoading: true});

		const clonedProduct = _.cloneDeep(productData);
		_.forEach(clonedProduct, (i, k) => {
			if (clonedProduct[k] === '') {
				clonedProduct[k] = null;
			}
		});

		const {merchantId} = this.props;
		const json = [clonedProduct];

		xhr({
			url: `/api/merchants/${merchantId}/products/verify/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});
			switch (resp.statusCode) {
				case 200: {
					this.productUpdate(productId, data[0]);
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось обновить товар');
					break;
				}
			}
		});
	}

	requestProductsSave() {
		this.setState({isUploading: true});

		const {merchantId} = this.props;
		const json = _.cloneDeep(this.state.products).map(product => product.data);

		xhr({
			url: `/api/merchants/${merchantId}/products/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isUploading: false});

			jQuery('.products-uploading-waiting-modal').modal('hide');

			switch (resp.statusCode) {
				case 201: {
					this.props.onSubmit(data);
					break;
				}
				case 400: {
					if (data.detail) {
						if (data.detail === 'out_of_limit') {
							toastr.warning('Превышен лимит');
						}
					} else {
						processErrors(data);
					}
					break;
				}
				default: {
					toastr.error('Не удалось загрузить товары');
					break;
				}
			}
		});
	}

	getProductById(id) {
		return _.find(this.state.products, product => product.data._id === id);
	}

	productUpdate(productId, productData) {
		const {
			products
		} = this.state;

		const product = this.getProductById(productId);
		const index = _.findIndex(products, product);
		products.splice(index, 1, productData);

		this.forceUpdate();
	}

	isInvalid() {
		let isInvalid = false;
		_.forEach(this.state.products, product => {
			if (!product.errors.length) {
				return;
			}
			isInvalid = true;
			return false;
		});
		return isInvalid;
	}

	render() {
		const {
			categoriesAvailableOptions,
			isLoading,
			isUploading,
			products
		} = this.state;
		const isInvalid = this.isInvalid();
		const isWaiting = isLoading;

		const uploadPanel = (
			<p className="text-right">
				<span style={{marginRight: '20px'}}>
					{'Добавлено '}

					<strong>
						{products.length}
					</strong>
				</span>

				<button
					className="btn btn-success"
					type="button"
					onClick={this.handleClickProductsSave}
					disabled={isInvalid || isUploading}
					data-toggle="modal"
					data-target=".products-uploading-waiting-modal"
					>
					{isUploading ? 'Загрузка...' : 'Подтвердить'}
				</button>
			</p>
		);

		return (
			<div className="goods-control">
				<IsLoadingWrapper isLoading={isWaiting}>
					{uploadPanel}

					<table className={'table table-hover ' + b(className, 'table')}>
						<thead>
							<tr>
								<th className={b(className, 'table-th', {name: 'name'})}>
									<span>
										{FEED_CELL.name}
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

								<th className={b(className, 'table-th', {name: 'startprice'})}>
									<span>
										{FEED_CELL.startPrice}
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
								<ProductsNewTableRow
									key={product.data._id}
									id={product.data._id}
									data={product.data}
									errors={product.errors}
									warnings={product.warnings}
									categoriesAvailable={categoriesAvailableOptions}
									onChange={this.handleChangeProduct}
									/>
							))}
						</tbody>
					</table>

					{uploadPanel}
				</IsLoadingWrapper>
			</div>
		);
	}
}
ProductsNewTable.propTypes = {
	categoriesAvailable: React.PropTypes.array,
	merchantId: React.PropTypes.number,
	onSubmit: React.PropTypes.func,
	products: React.PropTypes.array
};
ProductsNewTable.defaultProps = {
	categoriesAvailable: []
};

export default ProductsNewTable;

class ProductsNewTableRow extends React.Component {
	constructor(props) {
		super(props);
		const {errors, warnings} = props;
		this.state = {
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		};

		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
	}

	componentWillReceiveProps(newProps) {
		const {errors, warnings} = newProps;
		this.setState({
			errors: this.processErrors(errors),
			warnings: this.processErrors(warnings)
		});
	}

	handleChangeCell(values) {
		const data = _.cloneDeep(this.props.data);
		values.forEach(item => {
			data[item.name] = item.value === '' ? null : item.value;
		});
		this.props.onChange(this.props.id, data);
	}

	handleChangeCategory(value) {
		const data = _.cloneDeep(this.props.data);
		data.category = value;
		this.props.onChange(this.props.id, data);
	}

	processErrors(errors) {
		return errors.reduce((a, b) => {
			if (!a[b.field]) {
				a[b.field] = [];
			}
			a[b.field].push(b.message);

			return a;
		}, {});
	}

	hasErrors(name) {
		const {errors} = this.state;
		return Boolean(errors[name]);
	}

	hasWarnings(name) {
		const {warnings} = this.state;
		return Boolean(warnings[name]);
	}

	getClassName(name) {
		if (this.hasErrors(name)) {
			return 'bg-danger';
		}

		if (this.hasWarnings(name)) {
			return 'bg-warning';
		}

		return '';
	}

	render() {
		const {errors, warnings} = this.state;
		const {
			categoriesAvailable,
			data
		} = this.props;

		return (
			<tr>
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

				<ProductsTableCell
					names={['category']}
					errors={errors}
					warnings={warnings}
					>
					<Select
						options={categoriesAvailable}
						selected={data.category}
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
ProductsNewTableRow.propTypes = {
	categoriesAvailable: React.PropTypes.array,
	data: React.PropTypes.object,
	errors: React.PropTypes.array,
	id: React.PropTypes.number,
	onChange: React.PropTypes.func,
	warnings: React.PropTypes.array
};
ProductsNewTableRow.defaultProps = {
	errors: [],
	warnings: []
};
