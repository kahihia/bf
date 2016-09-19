/* global moment, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import DatePicker from 'react-datepicker';
import InvoiceActions from './invoice-actions.js';
import InvoiceItem from './invoice-item.jsx';
import {invoiceStatuses} from './invoice-status.jsx';
import ChangeManyInvoiceStatusesBtn from './change-many-invoice-statuses-btn.jsx';

export const invoiceActions = new InvoiceActions();

export class InvoiceList extends React.Component {
	constructor() {
		super();
		this.state = {
			allSelected: false,
			data: [],
			filters: {},
			isLoading: true,
			newStatus: 'paid',
			ordering: null,
			selectedItems: []
		};

		this.handleChangeDateFilter = this.handleChangeDateFilter.bind(this);
		this.handleChangeInvoiceFilter = this.handleChangeInvoiceFilter.bind(this);
		this.handleChangeNameFilter = this.handleChangeNameFilter.bind(this);
		this.handleChangeNewStatus = this.handleChangeNewStatus.bind(this);
		this.handleChangeStatusFilter = this.handleChangeStatusFilter.bind(this);
		this.handleChangeSumStartFilter = this.handleChangeSumStartFilter.bind(this);
		this.handleChangeSumStopFilter = this.handleChangeSumStopFilter.bind(this);
		this.handleFilter = this.handleFilter.bind(this);
		this.handleFiltersReset = this.handleFiltersReset.bind(this);
		this.handleOrderingByDate = this.handleOrderingByDate.bind(this);
		this.handleOrderingBySum = this.handleOrderingBySum.bind(this);
		this.handleSelectAll = this.handleSelectAll.bind(this);
		this.makeFilterUrl = this.makeFilterUrl.bind(this);
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

	onItemSelected(itemId) {
		let selectedItems = this.state.selectedItems.slice();

		for (let i = 0; i < this.state.data.length; i++) {
			if (this.state.data[i].id === itemId) {
				selectedItems.push(this.state.data[i]);
			}
		}

		this.setState({
			allSelected: (selectedItems.length === this.state.data.length),
			selectedItems: selectedItems
		});
	}

	onItemUnselected(itemId) {
		let selectedItems = this.state.selectedItems.slice();

		for (let i = 0; i < selectedItems.length; i++) {
			if (selectedItems[i].id === itemId) {
				selectedItems.splice(i, 1);
			}
		}

		this.setState({
			allSelected: false,
			selectedItems: selectedItems
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
		const expired = options.newDate.format('YYYY-MM-DD hh:mm:ss');

		xhr({
			url: '/admin/invoices',
			method: 'PUT',
			json: [{
				id: options.invoiceId,
				expired: expired
			}]
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				const invoice = _.find(this.state.data, {id: options.invoiceId});
				invoice.expired = expired;
			}

			this.setState({
				isLoading: false
			});
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
		this.setState({
			newStatus: event.target.value
		});
	}

	handleChangeDateFilter(date) {
		const filters = Object.assign({}, this.state.filters, {date: date});
		this.setState({filters});
	}

	handleChangeNameFilter(event) {
		const filters = Object.assign({}, this.state.filters, {name: event.target.value});
		this.setState({filters});
	}

	handleChangeInvoiceFilter(event) {
		const filters = Object.assign({}, this.state.filters, {invoice: event.target.value});
		this.setState({filters});
	}

	handleChangeSumStartFilter(event) {
		const filters = Object.assign({}, this.state.filters, {sumStart: event.target.value});
		this.setState({filters});
	}

	handleChangeSumStopFilter(event) {
		const filters = Object.assign({}, this.state.filters, {sumStop: event.target.value});
		this.setState({filters});
	}

	handleChangeStatusFilter(event) {
		const filters = Object.assign({}, this.state.filters, {
			status: (event.target.value === 'any') ? null : event.target.value
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

			this.setState({
				ordering: newOrdering
			}, this.handleFilter);
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

			this.setState({
				ordering: newOrdering
			}, this.handleFilter);
		}
	}

	makeFilterUrl() {
		const {filters, ordering} = this.state;
		let params = {};

		if (filters.date) {
			params.created_at = filters.date.format('YYYY-MM-DD');
		}
		if (filters.name) {
			params.name = filters.name;
		}
		if (filters.invoice) {
			params.invoice = filters.invoice;
		}
		if (filters.sumStart) {
			params.sum_start = filters.sumStart;
		}
		if (filters.sumStop) {
			params.sum_stop = filters.sumStop;
		}
		if (filters.status && (filters.status !== 'any')) {
			params.status = filters.status;
		}
		if (ordering) {
			params.order_by = ordering;
		}

		let result = '/admin/invoices?' + Object.keys(params).reduce((memo, key) => {
			return memo + (key + '=' + encodeURIComponent(params[key]) + '&');
		}, '');

		return result.slice(0, -1);
	}

	handleFilter() {
		const url = this.makeFilterUrl();

		this.setState({
			isLoading: true
		}, () => {
			xhr({
				url,
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					this.setState({data});
				}

				this.setState({isLoading: false});
			});
		});
	}

	handleFiltersReset() {
		this.setState({
			filters: {
				status: 'any'
			}
		}, this.handleFilter);
	}

	componentDidMount() {
		xhr({
			url: '/api/invoices/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				this.setState({data});
			}

			this.setState({isLoading: false});
		});
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
									<label>Дата</label>
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
									onChange={this.handleChangeDateFilter}
									/>
							</div>
							<div className="form-group col-sm-2">
								<div>
									<label>Юр.лицо / магазин</label>
								</div>
								<input
									type="text"
									className="form-control"
									style={{fontSize: 14}}
									value={filters.name}
									disabled={isLoading}
									onChange={this.handleChangeNameFilter}
									/>
							</div>
							<div className="form-group col-sm-2">
								<div>
									<label>№ счёта</label>
								</div>
								<input
									type="text"
									className="form-control"
									style={{fontSize: 14}}
									value={filters.invoice}
									disabled={isLoading}
									onChange={this.handleChangeInvoiceFilter}
									/>
							</div>
							<div className="form-group col-sm-4">
								<div className="row">
									<div className="col-sm-12">
										<label>Сумма</label>
									</div>
									<div className="col-sm-2">
										<div className="form-control-static">от</div>
									</div>
									<div className="col-sm-4">
										<input
											type="text"
											className="form-control"
											style={{fontSize: 14}}
											value={filters.sumStart}
											disabled={isLoading}
											onChange={this.handleChangeSumStartFilter}
											/>
									</div>
									<div className="col-sm-2">
										<div className="form-control-static">до</div>
									</div>
									<div className="col-sm-4">
										<input
											type="text"
											className="form-control"
											style={{fontSize: 14}}
											value={filters.sumStop}
											disabled={isLoading}
											onChange={this.handleChangeSumStopFilter}
											/>
									</div>
								</div>
							</div>
							<div className="form-group col-sm-2">
								<div>
									<label>Статус</label>
								</div>
								<select
									className="form-control"
									style={{fontSize: 14}}
									value={filters.status}
									defaultValue={filters.status === 'any'}
									disabled={isLoading}
									onChange={this.handleChangeStatusFilter}
									>
									<option value="any">Все</option>
									<option value="paid">{invoiceStatuses.paid}</option>
									<option value="waiting">{invoiceStatuses.waiting}</option>
									<option value="canceled">{invoiceStatuses.canceled}</option>
								</select>
							</div>
							<div className="col-sm-6">
								<button
									type="button"
									className="btn btn-link"
									disabled={isLoading}
									onClick={this.handleFiltersReset}
									>
									Очистить фильтры
								</button>
							</div>
							<div className="col-sm-6 text-right">
								<button
									type="button"
									className="btn btn-default"
									disabled={isLoading}
									onClick={this.handleFilter}
									>
									Фильтровать
								</button>
							</div>
						</div>
					</div>
				</div>

				<div className="form-group">
					<div className="col-sm-2">
						<div className="form-control-static">Для выбранных</div>
					</div>
					<div className="col-sm-4">
						<select
							className="form-control"
							value={newStatus}
							disabled={noSelectedItems || isLoading}
							onChange={this.handleChangeNewStatus}
							>
							<option value="paid">Изменить статус на &laquo;Оплачен&raquo;</option>
							<option value="waiting">Изменить статус на &laquo;Не оплачен&raquo;</option>
							<option value="canceled">Изменить статус на &laquo;Отменён&raquo;</option>
						</select>
					</div>
					<div className="col-sm-2">
						<ChangeManyInvoiceStatusesBtn
							invoiceIds={selectedItemsIds}
							disabled={noSelectedItems || isLoading}
							newStatus={newStatus}
							/>
					</div>
					<div className="col-sm-4 text-right">
						{isLoading ?
							(<div className="form-control-static text-muted">Загрузка...</div>) :
							null
						}
					</div>
				</div>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>
								<input type="checkbox" checked={allSelected} onChange={this.handleSelectAll}/>
							</th>
							<th>
								<span
									style={{borderBottom: '1px dotted', cursor: 'pointer'}}
									onClick={this.handleOrderingByDate}
									>
									Дата&nbsp;<i className={orderByDateIconCssClass}/>
								</span>
							</th>
							<th>Юр. лицо</th>
							<th>Магазин</th>
							<th>№ счёта</th>
							<th>Пакет</th>
							<th>Доп. опции</th>
							<th>
								<span
									style={{borderBottom: '1px dotted', cursor: 'pointer'}}
									onClick={this.handleOrderingBySum}
									>
									Сумма&nbsp;<i className={orderBySumIconCssClass}/>
								</span>
							</th>
							<th>Статус</th>
						</tr>
					</thead>
					<tbody>
						{data.map(function (invoiceItem) {
							const itemIsSelected = (selectedItems.indexOf(invoiceItem.id) >= 0);

							return (
								<InvoiceItem
									data={invoiceItem}
									selected={itemIsSelected}
									key={invoiceItem.id}
									/>
							);
						})}
					</tbody>
				</table>
				<div className="form-group">
					<div className="col-sm-2">
						<div className="form-control-static">Для выбранных</div>
					</div>
					<div className="col-sm-4">
						<select
							className="form-control"
							value={newStatus}
							disabled={noSelectedItems || isLoading}
							onChange={this.handleChangeNewStatus}
							>
							<option value="paid">Изменить статус на &laquo;Оплачен&raquo;</option>
							<option value="waiting">Изменить статус на &laquo;Не оплачен&raquo;</option>
							<option value="canceled">Изменить статус на &laquo;Отменён&raquo;</option>
						</select>
					</div>
					<div className="col-sm-2">
						<ChangeManyInvoiceStatusesBtn
							invoiceIds={selectedItemsIds}
							disabled={noSelectedItems || isLoading}
							newStatus={newStatus}
							/>
					</div>
					<div className="col-sm-4 text-right">
						{isLoading ?
							(<div className="form-control-static text-muted">Загрузка...</div>) :
							null
						}
					</div>
				</div>
			</div>
		);
	}
}
