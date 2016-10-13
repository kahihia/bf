/* eslint react/require-optimization: 0 */

import React from 'react';
import Price from 'react-price';
import {formatPrice} from '../utils.js';
import SortHeaderCell from '../components/sort-header-cell.jsx';
import EditableCell from './editable-cell.jsx';

class ProductsTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			colSortDirs: {}
		};

		this.handleSelectAllProducts = this.handleSelectAllProducts.bind(this);
		this.handleSortChange = this.handleSortChange.bind(this);
		this.handleSelectProduct = this.handleSelectProduct.bind(this);
		this.handleChangeProduct = this.handleChangeProduct.bind(this);
		this.handleChangeProductTeaser = this.handleChangeProductTeaser.bind(this);
		this.handleChangeProductOnMain = this.handleChangeProductOnMain.bind(this);
	}

	handleSelectAllProducts() {
	}

	handleSortChange() {
	}

	handleSelectProduct() {
	}

	handleChangeProduct() {
	}

	handleChangeProductTeaser() {
	}

	handleChangeProductOnMain() {
	}

	isAllSelected() {
		const isFalse = Boolean(this.props.products.filter(product => !product.isSelected).length);
		return !isFalse;
	}

	render() {
		const {colSortDirs} = this.state;
		const {products} = this.props;
		const isAllSelected = this.isAllSelected();

		return (
			<div className="">
				<table className="table products-table">
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
						{products.map(product => (
							<ProductsTableRow
								key={product.data._id}
								id={product.data._id}
								data={product.data}
								isSelected={product.isSelected}
								onSelect={this.handleSelectProduct}
								onChange={this.handleChangeProduct}
								onChangeTeaser={this.handleChangeProductTeaser}
								onChangeTeaserOnMain={this.handleChangeProductOnMain}
								/>
						))}
					</tbody>
				</table>
			</div>
		);
	}
}
ProductsTable.propTypes = {
	products: React.PropTypes.array
};
ProductsTable.defaultProps = {
};

export default ProductsTable;

class ProductsTableRow extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleSelect = this.handleSelect.bind(this);
		this.handleChangeCell = this.handleChangeCell.bind(this);
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
				value: false
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
			name: 'categoryId',
			value: value
		}]);
	}

	handleChangeStartprice() {
		this.props.onChange(this.props.id, [{
			name: 'startPrice',
			value: !this.props.data.startPrice
		}]);
	}

	handleChangeTeaser() {
		this.props.onChangeTeaser(this.props.id);
	}

	handleChangeTeaserOnMain() {
		this.props.onChangeTeaserOnMain(this.props.id);
	}

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
							checked={data.startPrice}
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
						{data.startPrice ? 'от ' : null}
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
						{data.startPrice ? 'от ' : null}
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
					{data.category}
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
	onSelect: React.PropTypes.func.isRequired,
	onChange: React.PropTypes.func.isRequired,
	onChangeTeaser: React.PropTypes.func.isRequired,
	onChangeTeaserOnMain: React.PropTypes.func.isRequired
};
ProductsTableRow.defaultProps = {
};
