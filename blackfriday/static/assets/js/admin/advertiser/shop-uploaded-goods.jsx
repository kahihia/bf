/* global window, toastr, _, jQuery */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Price from 'react-price';
import Scroll from 'react-scroll';
import {formatPrice} from '../utils.js';
import Select from '../components/select.jsx';
import EditableCell from './editable-cell.jsx';
import {renderGoodsCounter} from './goods-counter.jsx';
import errorCollector from './error-collector.js';
import getCategories from './categories.js';

const FEED_CELL = {
	name: 'Название',
	description: 'Описание',
	url: 'URL',
	startprice: 'Цена от',
	oldprice: 'Старая цена',
	price: 'Цена',
	discount: 'Скидка',
	countryoforigin: 'Страна производства',
	vendor: 'Производитель',
	category: 'Категория',
	image: 'Картинка',
	image1: 'Картинка 1',
	image2: 'Картинка 2',
	image3: 'Картинка 3'
};

class ShopUploadedGoods extends React.Component {
	constructor(props) {
		super(props);

		const processedProps = this.processProps(props.data);

		this.state = {
			warnings: processedProps.warnings,
			errors: processedProps.errors,
			goods: processedProps.goods,
			allErrorRows: processedProps.allErrorRows,
			allWarningRows: processedProps.allWarningRows,
			allowedCategories: [],
			isUploading: false
		};

		renderGoodsCounter({countAdded: processedProps.goods.length});

		this.handleChangeGood = this.handleChangeGood.bind(this);
		this.handleClickGoodsSave = this.handleClickGoodsSave.bind(this);
	}

	componentDidMount() {
		getCategories(allowedCategories => {
			this.setState({
				allowedCategories: allowedCategories.map(category => {
					return {
						name: category.name,
						id: category.name.toLowerCase()
					};
				})
			});
		});
	}

	componentWillReceiveProps(newProps) {
		const props = this.processProps(newProps.data);
		this.setState({
			warnings: props.warnings,
			errors: props.errors,
			goods: props.goods,
			allErrorRows: props.allErrorRows,
			allWarningRows: props.allWarningRows,
			isUploading: false
		});
		renderGoodsCounter({countAdded: props.goods.length});
	}

	processProps(props) {
		const goods = [];
		if (props.result) {
			_.forEach(props.result, (value, key) => {
				value.id = parseInt(key, 10);
				const {category} = value;
				if (category && typeof category === 'string') {
					value.category = category.toLowerCase();
				}
				if (!value.startprice) {
					value.startprice = 'нет';
				}
				goods.push(value);
			});
		}

		return {
			warnings: props.warnings || {},
			errors: props.errors || {},
			goods: goods,
			allErrorRows: this.collectErrorRows(props.errors || {}),
			allWarningRows: this.collectErrorRows(props.warnings || {})
		};
	}

	collectErrorRows(errors) {
		let rows = errorCollector(errors);
		rows = rows.sort();
		return rows;
	}

	handleChangeGood(goodId, goodData) {
		this.requestChangeGood(goodId, goodData);
	}

	handleClickGoodsSave() {
		this.requestGoodsSave(_.cloneDeep(this.state.goods));
	}

	requestChangeGood(goodId, goodData) {
		xhr({
			url: `/feeds/merchant/${window.itemId}/goods/validate`,
			method: 'POST',
			json: goodData
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				toastr.success('Настройки сохранены');
				_.merge(this.getGoodById(goodId), goodData);
				this.updateGoodErrors(goodId, data.errors);
				this.updateGoodWarnings(goodId, data.warnings);
			} else {
				toastr.error('Не удалось обновить товар');
			}
		});
	}

	updateGoodErrors(goodId, goodErrors) {
		const isValid = isEmptyObject(goodErrors);
		const errors = this.state.errors;
		let allErrorRows = this.state.allErrorRows;

		_.forEach(errors, type => {
			_.forEach(type, subtype => {
				subtype.rows = _.without(subtype.rows, goodId);
			});
		});

		if (isValid) {
			allErrorRows = _.without(allErrorRows, goodId);
		} else {
			_.forEach(goodErrors, (type, typeName) => {
				if (!errors[typeName]) {
					errors[typeName] = {};
				}
				if (!errors[typeName][type.name]) {
					errors[typeName][type.name] = {
						message: type.message,
						rows: []
					};
				}
				if (errors[typeName][type.name].rows.indexOf(goodId) === -1) {
					errors[typeName][type.name].rows.push(goodId);
					errors[typeName][type.name].rows.sort();
				}
				if (allErrorRows.indexOf(goodId) === -1) {
					allErrorRows.push(goodId);
				}
			});
		}

		this.setState({
			allErrorRows: allErrorRows,
			errors: errors
		});
	}

	updateGoodWarnings(goodId, goodWarnings) {
		const isValid = isEmptyObject(goodWarnings);
		const warnings = this.state.warnings;
		let allWarningRows = this.state.allWarningRows;

		_.forEach(warnings, type => {
			type.rows = _.without(type.rows, goodId);
		});

		if (isValid) {
			allWarningRows = _.without(allWarningRows, goodId);
		} else {
			_.forEach(goodWarnings, (type, typeName) => {
				if (!warnings[typeName]) {
					warnings[typeName] = {
						message: type.message,
						rows: []
					};
				}
				if (warnings[typeName].rows.indexOf(goodId) === -1) {
					warnings[typeName].rows.push(goodId);
					warnings[typeName].rows.sort();
				}
				if (allWarningRows.indexOf(goodId) === -1) {
					allWarningRows.push(goodId);
				}
			});
		}

		this.setState({
			allWarningRows: allWarningRows,
			warnings: warnings
		});
	}

	requestGoodsSave(goodsData) {
		this.setState({isUploading: true});
		xhr({
			url: `/feeds/merchant/${window.itemId}/goods/confirm`,
			method: 'POST',
			json: goodsData.reduce((a, b) => {
				a[b.id] = b;
				return a;
			}, {})
		}, (err, resp, data) => {
			this.setState({isUploading: false});
			if (!err && resp.statusCode === 200) {
				toastr.success('Настройки сохранены');
				if (isEmptyObject(data.errors)) {
					window.location.reload(true);
					return;
				}
				if (data.result) {
					const props = this.processProps(data);
					this.setState({
						warnings: props.warnings,
						errors: props.errors,
						goods: props.goods,
						allErrorRows: props.allErrorRows,
						allWarningRows: props.allWarningRows
					});
				}
			} else {
				toastr.error('Не удалось загрузить товары');
				jQuery('.products-uploading-waiting-modal').modal('hide');
			}
		});
	}

	getGoodById(goodId) {
		return _.find(this.state.goods, {id: goodId});
	}

	isGoodInvalid(goodId) {
		return this.state.allErrorRows.indexOf(goodId) > -1;
	}

	isGoodHasWarnings(goodId) {
		return this.state.allWarningRows.indexOf(goodId) > -1;
	}

	isInvalid() {
		return Boolean(this.state.allErrorRows.length);
	}

	render() {
		const isInvalid = this.isInvalid();
		const isWarnings = Boolean(this.state.allWarningRows.length);

		return (
			<div className="goods-control">
				{isInvalid || isWarnings ? (
					<div className="goods-control__info-block">
						{isInvalid ? (
							<Errors
								errors={this.state.errors}
								allErrorRows={this.state.allErrorRows}
								/>
						) : null}
						{isWarnings ? (
							<Warnings
								warnings={this.state.warnings}
								/>
						) : null}
					</div>
				) : null}

				<table className="goods-table table">
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
									{FEED_CELL.startprice}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.oldprice}
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
									{FEED_CELL.countryoforigin}
								</span>
							</th>
							<th>
								<span>
									{FEED_CELL.vendor}
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
						{this.state.goods.map(good => {
							return (
								<GoodsTableRow
									key={good.id}
									id={good.id}
									data={good}
									allowedCategories={this.state.allowedCategories}
									invalid={this.isGoodInvalid(good.id)}
									hasWarnings={this.isGoodHasWarnings(good.id)}
									onChange={this.handleChangeGood}
									/>
							);
						})}
					</tbody>
				</table>

				<p className="text-right">
					<button
						className="btn btn-success"
						type="button"
						onClick={this.handleClickGoodsSave}
						disabled={isInvalid || this.state.isUploading}
						data-toggle="modal"
						data-target=".products-uploading-waiting-modal"
						>
						{this.state.isUploading ? 'Загрузка...' : 'Подтвердить'}
					</button>
				</p>
			</div>
		);
	}
}
ShopUploadedGoods.propTypes = {
	data: React.PropTypes.object
};
ShopUploadedGoods.defaultProps = {
	data: {}
};

export default ShopUploadedGoods;

const GoodsTableRow = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		data: React.PropTypes.object,
		allowedCategories: React.PropTypes.array,
		invalid: React.PropTypes.bool,
		hasWarnings: React.PropTypes.bool,
		onChange: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleCellChange(values) {
		const data = _.cloneDeep(this.props.data);
		values.forEach(item => {
			data[item.name] = item.value;
		});
		this.props.onChange(this.props.id, data);
	},

	handleChangeCategory(value) {
		const data = _.cloneDeep(this.props.data);
		data.category = value;
		this.props.onChange(this.props.id, data);
	},

	handleChangeStartprice() {
		const data = _.cloneDeep(this.props.data);
		data.startprice = data.startprice === 'да' ? 'нет' : 'да';
		this.props.onChange(this.props.id, data);
	},

	render() {
		const data = this.props.data;
		let className = '';
		if (this.props.invalid) {
			className += ' bg-danger';
		}
		if (this.props.hasWarnings) {
			className += ' bg-warning';
		}

		return (
			<tr className={className}>
				<td>
					{this.props.invalid || this.props.hasWarnings ? (
						<Scroll.Element name={`anchor-error-row-${this.props.id}`}/>
					) : null}
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
							checked={data.startprice === 'да'}
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
						{data.startprice === 'да' ? 'от ' : ''}
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
						{data.startprice === 'да' ? 'от ' : ''}
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
					<EditableCell
						values={[{
							name: 'vendor',
							value: data.vendor
						}]}
						onChange={this.handleCellChange}
						>
						{data.vendor}
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

class Errors extends React.Component {
	constructor(props) {
		super(props);
		const errors = this.collectErrors(props);
		this.state = errors;
	}

	componentWillReceiveProps(newProps) {
		this.setState(this.collectErrors(newProps));
	}

	collectErrors(props) {
		const errors = [];
		let errorsCount = 0;
		if (props && props.errors) {
			_.forEach(props.errors, (error, errorType) => {
				_.forEach(error, type => {
					if (!type.rows || !type.rows.length) {
						return;
					}
					errors.push({
						name: errorType,
						message: type.message,
						rows: type.rows
					});
					errorsCount += type.rows.length;
				});
			});
		}

		return {
			errorsCount: errorsCount,
			errors: errors
		};
	}

	render() {
		return (
			<div className="error-list">
				<ul className="props">
					<ErrorsItem
						id={'all'}
						label={'Всего ошибок'}
						rows={this.props.allErrorRows}
						/>
					{this.state.errors.map((item, index) => {
						return (
							<ErrorsItem
								key={index}
								id={String(index)}
								label={item.message}
								name={FEED_CELL[item.name] || item.name}
								rows={item.rows}
								/>
						);
					})}
				</ul>
			</div>
		);
	}
}
Errors.propTypes = {
	errors: React.PropTypes.object,
	allErrorRows: React.PropTypes.array
};
Errors.defaultProps = {
};

class ErrorsItem extends React.Component {
	render() {
		return (
			<li className="props__item">
				<span className="props__label">
					{this.props.label}
					{this.props.name ? (
						<strong>
							{` "${this.props.name}"`}
						</strong>
					) : null}
					{':'}
				</span>
				<span className="props__value">
					{this.props.rows.length}
				</span>
				<Scroll.Link
					className="props__link"
					to={`anchor-error-row-${this.props.rows[0]}`}
					offset={-200}
					smooth
					>
					{'Показать'}
				</Scroll.Link>
			</li>
		);
	}
}
ErrorsItem.propTypes = {
	id: React.PropTypes.string.isRequired,
	label: React.PropTypes.string.isRequired,
	name: React.PropTypes.string,
	rows: React.PropTypes.array.isRequired
};
ErrorsItem.defaultProps = {
};

class Warnings extends React.Component {
	constructor(props) {
		super(props);
		const warnings = this.collectWarnings(props);
		this.state = warnings;
	}

	componentWillReceiveProps(newProps) {
		this.setState(this.collectWarnings(newProps));
	}

	collectWarnings(props) {
		const warnings = [];
		if (props && props.warnings) {
			_.forEach(props.warnings, warning => {
				if (!warning.rows || !warning.rows.length) {
					return;
				}

				warnings.push(warning);
			});
		}

		return {
			warnings: warnings
		};
	}

	render() {
		return (
			<div className="warning-list">
				<ul className="props">
					{this.state.warnings.map((item, index) => {
						if (item.rows) {
							return false;
						}

						return (
							<li
								key={index}
								className="props__item"
								>
								<span className="props__label">
									{item.message}
								</span>
							</li>
						);
					})}
					{this.state.warnings.map((item, index) => {
						if (!item.rows) {
							return false;
						}

						return (
							<ErrorsItem
								key={index}
								id={String(index)}
								label={item.message}
								rows={item.rows}
								/>
						);
					})}
				</ul>
			</div>
		);
	}
}
Warnings.propTypes = {
	warnings: React.PropTypes.object
};
Warnings.defaultProps = {
};

function isEmptyObject(obj) {
	return !Object.keys(obj).length;
}
