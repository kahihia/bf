/* eslint react/require-optimization: 0 */

import React from 'react';

class ProductsTable extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleSelectAllProducts = this.handleSelectAllProducts.bind(this);
		this.handleSortChange = this.handleSortChange.bind(this);
		this.handleSelectProduct = this.handleSelectProduct.bind(this);
		this.handleChangeProduct = this.handleChangeProduct.bind(this);
	}

	handleSelectAllProducts() {
	}

	handleSortChange() {
	}

	handleSelectProduct() {
	}

	handleChangeProduct() {
	}

	render() {
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
						{this.props.products.map(product => {
							return (
								<ProductsTableRow
									key={product.id}
									id={product.id}
									data={product}
									isSelected={product.isSelected}
									onSelect={this.handleSelectProduct}
									onChange={this.handleChangeProduct}
									/>
							);
						})}
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
	}

	handleSelect() {
		this.props.onSelect(this.props.id, !this.props.isSelected);
	}

	handleChangeCell(values) {
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
	}

	handleChangeCategory(value) {
		this.props.onChange(this.props.id, [{
			name: 'categoryId',
			value: value
		}]);
	}

	handleChangeStartprice() {
		this.props.onChange(this.props.id, [{
			name: 'startprice',
			value: !this.props.data.startprice
		}]);
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
						onChange={this.handleChangeCell}
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
						onChange={this.handleChangeCell}
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
						options={this.props.allowedCategories}
						selected={data.categoryId}
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
	allowedCategories: React.PropTypes.array.isRequired,
	isSelected: React.PropTypes.bool,
	onSelect: React.PropTypes.func.isRequired,
	onChange: React.PropTypes.func.isRequired,
	onChangeTeaser: React.PropTypes.func.isRequired,
	onChangeTeaserAtMain: React.PropTypes.func.isRequired
};
ProductsTableRow.defaultProps = {
};
