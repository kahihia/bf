/* global toastr _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import xhr from 'xhr';
import {TOKEN, SORT_TYPES} from '../const.js';
import {formatPrice, processErrors} from '../utils.js';
import Select from '../components/select.jsx';
import SortHeaderCell from '../components/sort-header-cell.jsx';
import EditableCell from './editable-cell.jsx';
import IsLoadingWrapper from '../components/is-loading-wrapper.jsx';

class ProductsTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			colSortDirs: {},
			isLoading: false,
			products: props.products,
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
		const {products} = this.state;
		const item = _.find(products, {id: product.id});
		const index = _.findIndex(products, item);
		products.splice(index, 1, product);

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
			isLoading,
			products,
			queue
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

				<table className="table table-hover products-table">
					<thead>
						<tr>
							<th>
								<span>
									<input
										type="checkbox"
										checked={isAllSelected}
										onChange={this.handleSelectAllProducts}
										/>
								</span>
							</th>
							<th>
								<SortHeaderCell
									onSortChange={this.handleSortChange}
									columnKey="name"
									sortDir={colSortDirs.name}
									>
									{'Название'}
								</SortHeaderCell>
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
						{products.map(product => (
							<ProductsTableRow
								key={product.id}
								id={product.id}
								data={product}
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
	merchantId: React.PropTypes.number,
	availableCategories: React.PropTypes.array,
	products: React.PropTypes.array
};
ProductsTable.defaultProps = {
	availableCategories: []
};

export default ProductsTable;

class ProductsTableRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleSelect = this.handleSelect.bind(this);
		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
		this.handleChangeTeaser = this.handleChangeTeaser.bind(this);
		this.handleChangeTeaserOnMain = this.handleChangeTeaserOnMain.bind(this);
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

	render() {
		const {
			availableCategories,
			data,
			isSelected
		} = this.props;

		return (
			<tr>
				<td>
					<input
						type="checkbox"
						checked={isSelected}
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
				</td>
				<td>
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
				</td>
				<td>
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
				</td>
				<td>
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
				</td>
				<td>
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
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'country',
							value: data.country
						}]}
						onChange={this.handleChangeCell}
						>
						{data.country}
					</EditableCell>
				</td>
				<td>
					<input
						type="checkbox"
						name="isTeaser"
						checked={data.isTeaser}
						onChange={this.handleChangeTeaser}
						/>
				</td>
				<td>
					<input
						type="checkbox"
						name="isTeaserOnMain"
						checked={data.isTeaserOnMain}
						onChange={this.handleChangeTeaserOnMain}
						/>
				</td>
				<td>
					<Select
						options={availableCategories}
						selected={data.category.name}
						onChange={this.handleChangeCategory}
						/>
				</td>
				<td>
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
}
ProductsTableRow.propTypes = {
	id: React.PropTypes.number.isRequired,
	data: React.PropTypes.object.isRequired,
	isSelected: React.PropTypes.bool,
	availableCategories: React.PropTypes.object,
	onSelect: React.PropTypes.func.isRequired,
	onChange: React.PropTypes.func.isRequired
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
			<div className="form-inline">
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
