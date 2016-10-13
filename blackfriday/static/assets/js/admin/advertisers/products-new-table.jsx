/* global toastr _ jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import {TOKEN} from '../const.js';
import {formatPrice} from '../utils.js';
import Select from '../components/select.jsx';
import EditableCell from './editable-cell.jsx';

const FEED_CELL = {
	name: 'Название',
	description: 'Описание',
	url: 'URL',
	startPrice: 'Цена от',
	oldPrice: 'Старая цена',
	price: 'Цена',
	discount: 'Скидка',
	country: 'Страна производства',
	brand: 'Производитель',
	category: 'Категория',
	image: 'Картинка'
};

class ProductsNewTable extends React.Component {
	constructor(props) {
		super(props);

		this.state = {
			products: props.products,
			isUploading: false
		};

		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleClickProductsSave = this.handleClickProductsSave.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({
			products: newProps.products,
			isUploading: false
		});
	}

	handleChangeProduct(productId, productData) {
		this.requestChangeProduct(productId, productData);
	}

	handleClickProductsSave() {
		this.requestProductsSave();
	}

	requestChangeProduct(productId, productData) {
		const {merchantId} = this.props;
		const json = productData;

		xhr({
			url: `/api/merchants/${merchantId}/products/verify/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			if (resp.statusCode === 200) {
				const {products} = this.state;
				const index = _.findIndex(products, this.getProductById(productId));
				products.splice(index, 1, data);
			} else {
				toastr.error('Не удалось обновить товар');
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
			json
		}, (err, resp, data) => {
			this.setState({isUploading: false});

			if (resp.statusCode === 200) {
				this.setState({products: data});
			} else {
				toastr.error('Не удалось загрузить товары');
				jQuery('.modal-products-uploading-waiting').modal('hide');
			}
		});
	}

	getProductById(id) {
		return _.find(this.state.products, {id});
	}

	isInvalid() {
		return true;
	}

	isProductInvalid(id) {
		return Boolean(id);
	}

	render() {
		const {
			isUploading,
			products
		} = this.state;
		const {
			allowedCategories
		} = this.props;
		const isInvalid = this.isInvalid();

		return (
			<div className="goods-control">
				<table className="table products-table">
					<thead>
						<tr>
							<th>
								<span>
									{FEED_CELL.name}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.description}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.startPrice}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.oldPrice}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.price}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.discount}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.country}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.brand}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.category}
								</span>
							</th>
							<th>
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
								allowedCategories={allowedCategories}
								isInvalid={this.isProductInvalid(product.data._id)}
								onChange={this.handleChangeProduct}
								/>
						))}
					</tbody>
				</table>

				<p className="text-right">
					<button
						className="btn btn-success"
						type="button"
						onClick={this.handleClickProductsSave}
						disabled={isInvalid || isUploading}
						data-toggle="modal"
						data-target=".modal-products-uploading-waiting"
						>
						{isUploading ? 'Загрузка...' : 'Подтвердить'}
					</button>
				</p>
			</div>
		);
	}
}
ProductsNewTable.propTypes = {
	merchantId: React.PropTypes.number,
	allowedCategories: React.PropTypes.array,
	products: React.PropTypes.array
};
ProductsNewTable.defaultProps = {
};

export default ProductsNewTable;

class ProductsNewTableRow extends React.Component {
	constructor(props) {
		super(props);

		this.handleChangeCell = this.handleChangeCell.bind(this);
		this.handleChangeCategory = this.handleChangeCategory.bind(this);
		this.handleChangeStartprice = this.handleChangeStartprice.bind(this);
	}

	handleChangeCell(values) {
		const data = _.cloneDeep(this.props.data);
		values.forEach(item => {
			data[item.name] = item.value;
		});
		this.props.onChange(this.props.id, data);
	}

	handleChangeCategory(value) {
		const data = _.cloneDeep(this.props.data);
		data.category = value;
		this.props.onChange(this.props.id, data);
	}

	handleChangeStartprice() {
		const data = _.cloneDeep(this.props.data);
		data.startPrice = data.startPrice === 'да' ? 'нет' : 'да';
		this.props.onChange(this.props.id, data);
	}

	render() {
		const {
			data,
			isInvalid
		} = this.props;

		let className = '';

		if (isInvalid) {
			className += ' bg-danger';
		}

		return (
			<tr className={className}>
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
							name: 'description',
							value: data.description,
							type: 'textarea'
						}]}
						onChange={this.handleChangeCell}
						>
						{data.description}
					</EditableCell>
				</td>
				<td>
					{(data.price || data.price === 0) && (data.oldPrice || data.oldPrice === 0) ? (
						<input
							type="checkbox"
							onChange={this.handleChangeStartprice}
							checked={data.startPrice === 'да'}
							/>
					) : null}
				</td>
				<td>
					<EditableCell
						values={[{
							name: 'oldPrice',
							value: data.oldPrice
						}]}
						onChange={this.handleChangeCell}
						>
						{data.startPrice === 'да' ? 'от ' : ''}

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
						{data.startPrice === 'да' ? 'от ' : ''}

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
					<EditableCell
						values={[{
							name: 'brand',
							value: data.brand
						}]}
						onChange={this.handleChangeCell}
						>
						{data.brand}
					</EditableCell>
				</td>
				<td>
					<Select
						options={this.props.allowedCategories}
						selected={data.category}
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
ProductsNewTableRow.propTypes = {
	id: React.PropTypes.number,
	data: React.PropTypes.object,
	errors: React.PropTypes.array,
	warnings: React.PropTypes.array,
	allowedCategories: React.PropTypes.array,
	isInvalid: React.PropTypes.bool,
	onChange: React.PropTypes.func
};
ProductsNewTableRow.defaultProps = {
};
