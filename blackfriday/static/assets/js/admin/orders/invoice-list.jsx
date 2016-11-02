/* global window moment _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import DatePicker from 'react-datepicker';
import {TOKEN, PAYMENT_STATUS} from '../const.js';
import Input from '../components/input.jsx';
import InvoiceItem from './invoice-item.jsx';
import InvoiceListSelectedAction from './invoice-list-selected-action.jsx';

export class InvoiceList extends React.Component {
	constructor(props) {
		super(props);

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
			selectedItemsIds: []
		};

		this.handleFilterByDate = this.handleFilterByDate.bind(this);
		this.handleFilterByName = this.handleFilterByName.bind(this);
		this.handleFilterById = this.handleFilterById.bind(this);
		this.handleFilterByMinSum = this.handleFilterByMinSum.bind(this);
		this.handleFilterByMaxSum = this.handleFilterByMaxSum.bind(this);
		this.handleFilterByStatus = this.handleFilterByStatus.bind(this);

		this.handleChangeNewStatus = this.handleChangeNewStatus.bind(this);
		this.handleClickChangeStatuses = this.handleClickChangeStatuses.bind(this);
		this.handleFiltersReset = this.handleFiltersReset.bind(this);
		this.handleOrderingByDate = this.handleOrderingByDate.bind(this);
		this.handleOrderingBySum = this.handleOrderingBySum.bind(this);
		this.handleSelectAll = this.handleSelectAll.bind(this);

		this.handleSelectItem = this.handleSelectItem.bind(this);
		this.handleChangeItemExpireDate = this.handleChangeItemExpireDate.bind(this);
	}

	componentDidMount() {
		this.requestInvoices();
	}

	requestInvoices() {
		xhr({
			url: '/api/invoices/?exclude_supernova=1',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				data = _.sortBy(data, 'id').reverse();

				const activeMerchantId = this.getActiveMerchant();
				let invoice;
				let merchant;
				if (activeMerchantId) {
					invoice = _.find(data, item => (item.merchant.id === activeMerchantId));

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

	requestInvoicesStatuses(ids) {
		this.setState({isLoading: true});

		const {newStatus} = this.state;
		const json = {
			status: newStatus,
			ids
		};

		xhr({
			url: '/api/invoices/statuses/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (resp.statusCode === 200) {
				data.forEach(item => {
					const invoice = this.getInvoiceById(item.id);
					_.merge(invoice, item);
				});
				this.unselectAll();
			} else {
				toastr.error('Не удалось изменить статусы счетов');
			}
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

	handleSelectItem(id) {
		const {data, selectedItemsIds} = this.state;

		const index = selectedItemsIds.indexOf(id);
		if (index === -1) {
			selectedItemsIds.push(id);
		} else {
			selectedItemsIds.splice(index, 1);
		}

		this.setState({
			allSelected: (selectedItemsIds.length === data.length),
			selectedItemsIds
		});
	}

	selectAll() {
		const selectedItemsIds = this.state.data.map(item => item.id);

		this.setState({
			allSelected: true,
			selectedItemsIds
		});
	}

	unselectAll() {
		this.setState({
			allSelected: false,
			selectedItemsIds: []
		});
	}

	handleChangeItemExpireDate(id, date) {
		const expiredDate = date.format('YYYY-MM-DD');
		const json = {expiredDate};

		xhr({
			url: `/api/invoices/${id}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				const invoice = this.getInvoiceById(id);
				invoice.expiredDate = expiredDate;
			}

			this.setState({isLoading: false});
		});
	}

	getInvoiceById(id) {
		return _.find(this.state.data, {id});
	}

	handleSelectAll() {
		if (this.state.allSelected) {
			this.unselectAll();
		} else {
			this.selectAll();
		}
	}

	handleChangeNewStatus(e) {
		this.setState({newStatus: parseInt(e.target.value, 10)});
	}

	handleClickChangeStatuses(ids) {
		this.requestInvoicesStatuses(ids);
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

	handleFilterByStatus(e) {
		const value = e.target.value;
		const status = value === '' ? null : parseInt(value, 10);

		const filters = Object.assign({}, this.state.filters, {status});
		this.setState({filters});
	}

	handleOrderingByDate() {
		const {isLoading, ordering} = this.state;

		if (isLoading) {
			return;
		}

		let newOrdering;

		switch (ordering) {
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

	handleOrderingBySum() {
		const {isLoading, ordering} = this.state;

		if (isLoading) {
			return;
		}

		let newOrdering;

		switch (ordering) {
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

		return _.filter(data, item => (item.status === status));
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
			selectedItemsIds
		} = this.state;

		const filteredData = this.filterData(data);
		const sortedData = this.getSortedData(filteredData);

		const filteredSelectedItemsIds = filteredData.reduce((a, b) => {
			if (selectedItemsIds.indexOf(b.id) > -1) {
				a.push(b.id);
			}

			return a;
		}, []);
		const noSelectedItems = (filteredSelectedItemsIds.length === 0);

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

		let listStatus = null;

		if (!sortedData.length) {
			if (isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Счета отсутствуют';
			}
		}

		const statusRow = (
			<tr>
				<td
					colSpan="9"
					className="text-center text-muted"
					>
					{listStatus}
				</td>
			</tr>
		);

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
									value={filters.status === null ? '' : filters.status}
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
					onClickChangeStatuses={this.handleClickChangeStatuses}
					selectedItemsIds={filteredSelectedItemsIds}
					{...{
						isLoading,
						newStatus,
						noSelectedItems
					}}
					/>

				<table className="table table-hover">
					<thead>
						<tr>
							<th>
								<input
									type="checkbox"
									checked={allSelected}
									disabled={!sortedData.length}
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
						{sortedData.map(item => {
							const isSelected = (filteredSelectedItemsIds.indexOf(item.id) > -1);

							return (
								<InvoiceItem
									key={item.id}
									data={item}
									selected={isSelected}
									onSelect={this.handleSelectItem}
									onChangeExpireDate={this.handleChangeItemExpireDate}
									/>
							);
						})}

						{listStatus ? statusRow : null}
					</tbody>
				</table>

				{(sortedData.length >= 10) ? (
					<InvoiceListSelectedAction
						onChangeNewStatus={this.handleChangeNewStatus}
						onClickChangeStatuses={this.handleClickChangeStatuses}
						selectedItemsIds={filteredSelectedItemsIds}
						{...{
							isLoading,
							newStatus,
							noSelectedItems
						}}
						/>
				) : null}
			</div>
		);
	}
}

function contains(what, where) {
	if (where.toLowerCase().indexOf(what.toLowerCase()) > -1) {
		return true;
	}
	return false;
}
