/* global moment, _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import DatePicker from 'react-datepicker';
import InvoiceActions from './invoice-actions.js';
import InvoiceItem from './invoice-item.jsx';
import {PAYMENT_STATUS} from '../const.js';
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
			newStatus: 1,
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
		const expired = options.newDate.format('YYYY-MM-DD hh:mm:ss');

		xhr({
			url: '/admin/invoices',
			method: 'PUT',
			json: [{
				id: options.invoiceId,
				expired
			}]
		}, (err, resp) => {
			if (!err && resp.statusCode === 200) {
				const invoice = _.find(this.state.data, {id: options.invoiceId});
				invoice.expired = expired;
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
		this.setState({newStatus: event.target.value});
	}

	handleChangeDateFilter(date) {
		const filters = Object.assign({}, this.state.filters, {date});
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

	makeFilterUrl() {
		const {filters} = this.state;
		const params = {};

		if (filters.date) {
			params.date = filters.date.format('YYYY-MM-DD');
		}
		if (filters.name) {
			params.name = filters.name;
		}
		if (filters.invoice) {
			params.id = filters.invoice;
		}
		if (filters.sumStart) {
			params.min_sum = filters.sumStart;
		}
		if (filters.sumStop) {
			params.max_sum = filters.sumStop;
		}
		if (filters.status && (filters.status !== 'any')) {
			params.status = filters.status;
		}

		const result = '/api/invoices/?' + Object.keys(params).reduce((memo, key) => {
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
				status: ''
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

	getSortedData() {
		const {data, ordering} = this.state;
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

	render() {
		const {
			allSelected,
			filters,
			isLoading,
			newStatus,
			ordering,
			selectedItems
		} = this.state;

		const sortedData = this.getSortedData();
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
									onChange={this.handleChangeDateFilter}
									/>
							</div>

							<div className="form-group col-sm-2">
								<div>
									<label>
										{'Юр.лицо / магазин'}
									</label>
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
									<label>
										{'№ счёта'}
									</label>
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
										<div className="form-control-static">
											{'до'}
										</div>
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
									<label>
										{'Статус'}
									</label>
								</div>
								<select
									className="form-control"
									style={{fontSize: 14}}
									value={filters.status}
									defaultValue={filters.status === ''}
									disabled={isLoading}
									onChange={this.handleChangeStatusFilter}
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

							<div className="col-sm-6 text-right">
								<button
									className="btn btn-default"
									onClick={this.handleFilter}
									disabled={isLoading}
									type="button"
									>
									{'Фильтровать'}
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
								{'Юр. лицо'}
							</th>
							<th>
								{'Магазин'}
							</th>
							<th>
								{'№ счёта'}
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
									data={invoiceItem}
									selected={itemIsSelected}
									key={invoiceItem.id}
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

				<div className="col-sm-4">
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

				<div className="col-sm-4 text-right">
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
