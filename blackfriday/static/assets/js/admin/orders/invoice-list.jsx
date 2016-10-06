/* global window moment _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import DatePicker from 'react-datepicker';
import InvoiceActions from './invoice-actions.js';
import InvoiceItem from './invoice-item.jsx';
import {TOKEN, PAYMENT_STATUS} from '../const.js';
import Input from '../components/input.jsx';
import ChangeManyInvoiceStatusesBtn from './change-many-invoice-statuses-btn.jsx';

export const invoiceActions = new InvoiceActions();

export class InvoiceList extends React.Component {
	constructor() {
		super();
		this.state = {
			allSelected: false,
			data: [],
			filters: {
				date: null,
				name: null,
				id: null,
				minSum: null,
				maxSum: null,
				status: null
			},
			isLoading: true,
			newStatus: 1,
			ordering: null,
			selectedItems: []
		};

		this.handleFilterByDate = this.handleFilterByDate.bind(this);
		this.handleFilterByName = this.handleFilterByName.bind(this);
		this.handleFilterById = this.handleFilterById.bind(this);
		this.handleFilterByMinSum = this.handleFilterByMinSum.bind(this);
		this.handleFilterByMaxSum = this.handleFilterByMaxSum.bind(this);
		this.handleFilterByStatus = this.handleFilterByStatus.bind(this);

		this.handleChangeNewStatus = this.handleChangeNewStatus.bind(this);
		this.handleFiltersReset = this.handleFiltersReset.bind(this);
		this.handleOrderingByDate = this.handleOrderingByDate.bind(this);
		this.handleOrderingBySum = this.handleOrderingBySum.bind(this);
		this.handleSelectAll = this.handleSelectAll.bind(this);
		this.onItemExpireDateChanged = this.onItemExpireDateChanged.bind(this);
		this.onItemSelected = this.onItemSelected.bind(this);
		this.onItemUnselected = this.onItemUnselected.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.unselectAll = this.unselectAll.bind(this);

		invoiceActions.onItemSelected(actionData => {
			this.onItemSelected(actionData.id);
		});

		invoiceActions.onItemUnselected(actionData => {
			this.onItemUnselected(actionData.id);
		});

		invoiceActions.onAllUnselected(actionData => {
			this.unselectAll(actionData.stop);
		});

		invoiceActions.onItemExpireDateChanged(actionData => {
			this.onItemExpireDateChanged(actionData);
		});
	}

	componentDidMount() {
		this.requestInvoices();
	}

	requestInvoices() {
		xhr({
			url: '/api/invoices/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				data = _.sortBy(data, 'id').reverse();

				const activeMerchantId = this.getActiveMerchant();
				let invoice;
				let merchant;
				if (activeMerchantId) {
					invoice = _.find(data, item => {
						return item.merchant.id === activeMerchantId;
					});

					if (invoice) {
						merchant = invoice.merchant;
					}
				}

				this.setState(previousState => {
					if (merchant) {
						previousState.filters.name = merchant.name;
					}

					previousState.data = data;
					return previousState;
				});
			}

			this.setState({isLoading: false});
		});
	}

	getActiveMerchant() {
		const hash = window.location.hash;
		let activeMerchantId = null;

		if (/invoice/.test(hash)) {
			let param = hash.split('invoice')[1];

			if (param) {
				activeMerchantId = parseInt(param, 10);
			}
		}

		return activeMerchantId;
	}

	onItemSelected(itemId) {
		const selectedItems = this.state.selectedItems.slice();

		for (let i = 0; i < this.state.data.length; i++) {
			if (this.state.data[i].id === itemId) {
				selectedItems.push(this.state.data[i]);
			}
		}

		this.setState({
			allSelected: (selectedItems.length === this.state.data.length),
			selectedItems
		});
	}

	onItemUnselected(itemId) {
		const selectedItems = this.state.selectedItems.slice();

		for (let i = 0; i < selectedItems.length; i++) {
			if (selectedItems[i].id === itemId) {
				selectedItems.splice(i, 1);
			}
		}

		this.setState({
			allSelected: false,
			selectedItems
		});
	}

	selectAll(stop) {
		stop = stop || false;

		this.setState({
			allSelected: true,
			selectedItems: this.state.data
		}, () => {
			if (!stop) {
				invoiceActions.allSelected(true /* stop */);
			}
		});
	}

	unselectAll(stop) {
		stop = stop || false;

		this.setState({
			allSelected: false,
			selectedItems: []
		}, () => {
			if (!stop) {
				invoiceActions.allUnselected(true /* stop */);
			}
		});
	}

	onItemExpireDateChanged(options) {
		const id = options.invoiceId;
		const expiredDate = options.newDate.format('YYYY-MM-DD');

		xhr({
			url: `/api/invoices/${id}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: {expiredDate}
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				const invoice = _.find(this.state.data, {id});
				invoice.expiredDate = expiredDate;
			}

			this.setState({isLoading: false});
		});
	}

	handleSelectAll() {
		if (this.state.allSelected) {
			this.unselectAll();
		} else {
			this.selectAll();
		}
	}

	handleChangeNewStatus(event) {
		this.setState({newStatus: parseInt(event.target.value, 10)});
	}

	handleFilterByDate(date) {
		const filters = Object.assign({}, this.state.filters, {date});
		this.setState({filters});
	}

	handleFilterByName(e) {
		const filters = Object.assign({}, this.state.filters, {name: e.target.value});
		this.setState({filters});
	}

	handleFilterById(e) {
		let id = e.target.value;
		if (id !== '') {
			id = parseInt(id, 10);
		}

		const filters = Object.assign({}, this.state.filters, {id});
		this.setState({filters});
	}

	handleFilterByMinSum(e) {
		let minSum = e.target.value;
		if (minSum !== '') {
			minSum = parseInt(minSum, 10);
		}

		const filters = Object.assign({}, this.state.filters, {minSum});
		this.setState({filters});
	}

	handleFilterByMaxSum(e) {
		let maxSum = e.target.value;
		if (maxSum !== '') {
			maxSum = parseInt(maxSum, 10);
		}

		const filters = Object.assign({}, this.state.filters, {maxSum});
		this.setState({filters});
	}

	handleFilterByStatus(event) {
		const filters = Object.assign({}, this.state.filters, {
			status: (event.target.value === '') ? null : parseInt(event.target.value, 10)
		});

		this.setState({filters});
	}

	handleOrderingByDate() {
		if (!this.state.isLoading) {
			let newOrdering;

			switch (this.state.ordering) {
				case 'created_at':
					newOrdering = '-created_at';
					break;
				case '-created_at':
					newOrdering = null;
					break;
				default:
					newOrdering = 'created_at';
					break;
			}

			this.setState({ordering: newOrdering});
		}
	}

	handleOrderingBySum() {
		if (!this.state.isLoading) {
			let newOrdering;

			switch (this.state.ordering) {
				case 'sum':
					newOrdering = '-sum';
					break;
				case '-sum':
					newOrdering = null;
					break;
				default:
					newOrdering = 'sum';
					break;
			}

			this.setState({ordering: newOrdering});
		}
	}

	handleFiltersReset() {
		this.setState({
			filters: {
				date: null,
				name: null,
				id: null,
				minSum: null,
				maxSum: null,
				status: null
			}
		});
	}

	getSortedData(data) {
		const {ordering} = this.state;
		let sortedData = _.clone(data);

		switch (ordering) {
			case 'created_at':
				sortedData = _.sortBy(sortedData, 'id');
				break;
			case '-created_at':
				sortedData = _.sortBy(sortedData, 'id').reverse();
				break;
			case 'sum':
				sortedData = _.sortBy(sortedData, 'sum');
				break;
			case '-sum':
				sortedData = _.sortBy(sortedData, 'sum').reverse();
				break;
			default: {
				break;
			}
		}

		return sortedData;
	}

	filterByDate(data) {
		const {date} = this.state.filters;
		if (!date) {
			return data;
		}

		return _.filter(data, item => {
			return moment(item.createdDatetime).format('YYYY-MM-DD') === date.format('YYYY-MM-DD');
		});
	}

	filterByName(data) {
		const {name} = this.state.filters;
		if (!name) {
			return data;
		}

		return _.filter(data, item => {
			const {advertiser, merchant} = item;

			if (!advertiser.name && !merchant.name) {
				return false;
			}

			if (
				contains(name, advertiser.name) ||
				contains(name, merchant.name)
			) {
				return true;
			}

			return false;
		});
	}

	filterById(data) {
		const {id} = this.state.filters;
		if (!id) {
			return data;
		}

		return _.filter(data, {id});
	}

	filterByMinSum(data) {
		const {minSum} = this.state.filters;
		if (!minSum) {
			return data;
		}

		return _.filter(data, item => {
			return item.sum >= minSum;
		});
	}

	filterByMaxSum(data) {
		const {maxSum} = this.state.filters;
		if (!maxSum) {
			return data;
		}

		return _.filter(data, item => {
			return item.sum <= maxSum;
		});
	}

	filterByStatus(data) {
		const {status} = this.state.filters;
		if (status === null) {
			return data;
		}

		return _.filter(data, item => {
			return item.status === status;
		});
	}

	filterData(data) {
		let filteredData = data;

		filteredData = this.filterByDate(filteredData);
		filteredData = this.filterByName(filteredData);
		filteredData = this.filterById(filteredData);
		filteredData = this.filterByMinSum(filteredData);
		filteredData = this.filterByMaxSum(filteredData);
		filteredData = this.filterByStatus(filteredData);

		return filteredData;
	}

	render() {
		const {
			allSelected,
			data,
			filters,
			isLoading,
			newStatus,
			ordering,
			selectedItems
		} = this.state;

		let filteredData = this.filterData(data);
		const sortedData = this.getSortedData(filteredData);
		const selectedItemsIds = selectedItems.map(invoiceItem => {
			return invoiceItem.id;
		});
		const noSelectedItems = (selectedItems.length === 0);

		let orderByDateIconCssClass;
		let orderBySumIconCssClass;

		switch (ordering) {
			case 'created_at':
				orderByDateIconCssClass = 'glyphicon glyphicon-sort-by-attributes';
				orderBySumIconCssClass = 'glyphicon glyphicon-sort';
				break;
			case '-created_at':
				orderByDateIconCssClass = 'glyphicon glyphicon-sort-by-attributes-alt';
				orderBySumIconCssClass = 'glyphicon glyphicon-sort';
				break;
			case 'sum':
				orderByDateIconCssClass = 'glyphicon glyphicon-sort';
				orderBySumIconCssClass = 'glyphicon glyphicon-sort-by-attributes';
				break;
			case '-sum':
				orderByDateIconCssClass = 'glyphicon glyphicon-sort';
				orderBySumIconCssClass = 'glyphicon glyphicon-sort-by-attributes-alt';
				break;
			default:
				orderByDateIconCssClass = 'glyphicon glyphicon-sort';
				orderBySumIconCssClass = 'glyphicon glyphicon-sort';
				break;
		}

		return (
			<div>
				<div className="panel panel-default">
					<div className="panel-heading">
						<div className="row">
							<div className="form-group col-sm-2">
								<div>
									<label>
										{'Дата'}
									</label>
								</div>
								<DatePicker
									className="form-control datepicker-input-sm"
									style={{fontSize: 14}}
									dateFormat="YYYY-MM-DD"
									selected={filters.date || null}
									maxDate={moment()}
									locale="ru-ru"
									todayButton="Сегодня"
									disabled={isLoading}
									onChange={this.handleFilterByDate}
									/>
							</div>

							<div className="form-group col-sm-2">
								<div>
									<label>
										{'Рекламодатель'}
									</label>
								</div>
								<Input
									value={filters.name || ''}
									onChange={this.handleFilterByName}
									disabled={isLoading}
									/>
							</div>

							<div className="form-group col-sm-2">
								<div>
									<label>
										{'№ счёта'}
									</label>
								</div>
								<Input
									value={filters.id || ''}
									onChange={this.handleFilterById}
									disabled={isLoading}
									/>
							</div>

							<div className="form-group col-sm-4">
								<div className="row">
									<div className="col-sm-12">
										<label>
											{'Сумма'}
										</label>
									</div>

									<div className="col-sm-2">
										<div className="form-control-static">
											{'от'}
										</div>
									</div>
									<div className="col-sm-4">
										<Input
											value={filters.minSum || ''}
											onChange={this.handleFilterByMinSum}
											disabled={isLoading}
											/>
									</div>

									<div className="col-sm-2">
										<div className="form-control-static">
											{'до'}
										</div>
									</div>
									<div className="col-sm-4">
										<Input
											value={filters.maxSum || ''}
											onChange={this.handleFilterByMaxSum}
											disabled={isLoading}
											/>
									</div>
								</div>
							</div>

							<div className="form-group col-sm-2">
								<div>
									<label>
										{'Статус'}
									</label>
								</div>
								<select
									className="form-control"
									style={{fontSize: 14}}
									value={filters.status || ''}
									disabled={isLoading}
									onChange={this.handleFilterByStatus}
									>
									<option value="">
										{'Все'}
									</option>
									<option value={0}>
										{PAYMENT_STATUS[0]}
									</option>
									<option value={1}>
										{PAYMENT_STATUS[1]}
									</option>
									<option value={2}>
										{PAYMENT_STATUS[2]}
									</option>
								</select>
							</div>

							<div className="col-sm-6">
								<button
									className="btn btn-link"
									disabled={isLoading}
									onClick={this.handleFiltersReset}
									type="button"
									>
									{'Очистить фильтры'}
								</button>
							</div>
						</div>
					</div>
				</div>

				<InvoiceListSelectedAction
					onChangeNewStatus={this.handleChangeNewStatus}
					{...{
						isLoading,
						newStatus,
						noSelectedItems,
						selectedItemsIds
					}}
					/>

				<table className="table table-striped">
					<thead>
						<tr>
							<th>
								<input
									type="checkbox"
									checked={allSelected}
									onChange={this.handleSelectAll}
									/>
							</th>
							<th>
								<span
									style={{
										borderBottom: '1px dotted',
										cursor: 'pointer'
									}}
									onClick={this.handleOrderingByDate}
									>
									{'Дата '}
									<i className={orderByDateIconCssClass}/>
								</span>
							</th>
							<th>
								{'Рекламодатель'}
							</th>
							<th>
								{'Магазин'}
							</th>
							<th>
								{'№ счёта'}
							</th>
							<th>
								{'Пакет'}
							</th>
							<th>
								{'Доп. опции'}
							</th>
							<th>
								<span
									style={{borderBottom: '1px dotted', cursor: 'pointer'}}
									onClick={this.handleOrderingBySum}
									>
									{'Сумма '}
									<i className={orderBySumIconCssClass}/>
								</span>
							</th>
							<th>
								{'Статус'}
							</th>
						</tr>
					</thead>

					<tbody>
						{sortedData.map(invoiceItem => {
							const itemIsSelected = (selectedItems.indexOf(invoiceItem.id) >= 0);

							return (
								<InvoiceItem
									key={invoiceItem.id}
									data={invoiceItem}
									selected={itemIsSelected}
									/>
							);
						})}
					</tbody>
				</table>

				<InvoiceListSelectedAction
					onChangeNewStatus={this.handleChangeNewStatus}
					{...{
						isLoading,
						newStatus,
						noSelectedItems,
						selectedItemsIds
					}}
					/>
			</div>
		);
	}
}

class InvoiceListSelectedAction extends React.Component {
	constructor(props) {
		super(props);

		this.handleChangeNewStatus = this.handleChangeNewStatus.bind(this);
	}

	handleChangeNewStatus(e) {
		this.props.onChangeNewStatus(e);
	}

	render() {
		const {
			isLoading,
			newStatus,
			noSelectedItems,
			selectedItemsIds
		} = this.props;

		return (
			<div className="form-group">
				<div className="col-sm-2">
					<div className="form-control-static">
						{'Для выбранных'}
					</div>
				</div>

				<div className="col-sm-5">
					<select
						className="form-control"
						value={newStatus}
						disabled={noSelectedItems || isLoading}
						onChange={this.handleChangeNewStatus}
						>
						<option value={1}>
							{`Изменить статус на «${PAYMENT_STATUS[1]}»`}
						</option>
						<option value={0}>
							{`Изменить статус на «${PAYMENT_STATUS[0]}»`}
						</option>
						<option value={2}>
							{`Изменить статус на «${PAYMENT_STATUS[2]}»`}
						</option>
					</select>
				</div>

				<div className="col-sm-2">
					<ChangeManyInvoiceStatusesBtn
						invoiceIds={selectedItemsIds}
						disabled={noSelectedItems || isLoading}
						newStatus={newStatus}
						/>
				</div>

				<div className="col-sm-3 text-right">
					{isLoading ? (
						<div className="form-control-static text-muted">
							{'Загрузка...'}
						</div>
					) : null}
				</div>
			</div>
		);
	}
}
InvoiceListSelectedAction.propTypes = {
	isLoading: React.PropTypes.bool,
	newStatus: React.PropTypes.number,
	noSelectedItems: React.PropTypes.bool,
	onChangeNewStatus: React.PropTypes.func,
	selectedItemsIds: React.PropTypes.array
};
InvoiceListSelectedAction.defaultProps = {
};

function contains(what, where) {
	if (where.toLowerCase().indexOf(what.toLowerCase()) > -1) {
		return true;
	}
	return false;
}
