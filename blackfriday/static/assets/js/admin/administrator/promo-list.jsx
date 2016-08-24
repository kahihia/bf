/* global moment, _ */

import React from 'react';
import xhr from 'xhr';
import PromoActions from './promo-actions.js';
import PromoItem from './promo-item.jsx';
import MakeManyInvoicesBtn from './make-many-invoices-btn.jsx';

export const promoActions = new PromoActions();

export class PromoList extends React.Component {
	constructor() {
		super();
		this.state = {
			data: [],
			selectedItems: [],
			allSelected: false
		};

		this.onItemSelected = this.onItemSelected.bind(this);
		this.onItemUnselected = this.onItemUnselected.bind(this);
		this.selectAll = this.selectAll.bind(this);
		this.unselectAll = this.unselectAll.bind(this);
		this.handleSelectAll = this.handleSelectAll.bind(this);

		promoActions.onItemSelected(actionData => {
			this.onItemSelected(actionData.id);
		});

		promoActions.onItemUnselected(actionData => {
			this.onItemUnselected(actionData.id);
		});

		promoActions.onAllUnselected(actionData => {
			this.unselectAll(actionData.stop);
		});
	}

	onItemSelected(itemId) {
		const selectableItems = this.state.data.filter(promoItem => {
			return promoItem.is_custom;
		});
		let selectedItems = this.state.selectedItems.slice();

		for (let i = 0; i < selectableItems.length; i++) {
			if (selectableItems[i].id === itemId) {
				selectedItems.push(selectableItems[i]);
			}
		}

		this.setState({
			allSelected: (selectedItems.length === selectableItems.length),
			selectedItems: selectedItems
		});
	}

	onItemUnselected(itemId) {
		let selectedItems = this.state.selectedItems.slice();

		for (var i = 0; i < selectedItems.length; i++) {
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

		const selectableItems = this.state.data.filter(promoItem => {
			return promoItem.is_custom;
		});

		this.setState({
			allSelected: true,
			selectedItems: selectableItems
		}, function () {
			if (!stop) {
				promoActions.allSelected(true /* stop */);
			}
		});
	}

	unselectAll(stop) {
		stop = stop || false;

		this.setState({
			allSelected: false,
			selectedItems: []
		}, function () {
			if (!stop) {
				promoActions.allUnselected(true /* stop */);
			}
		});
	}

	handleSelectAll() {
		if (this.state.allSelected) {
			this.unselectAll();
		} else {
			this.selectAll();
		}
	}

	componentDidMount() {
		xhr.get('/admin/promos/list', {json: true}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				const dateFunction = p => {
					return moment(p.created_at);
				};

				this.setState({
					data: _.orderBy(
						data,
						['is_custom', 'advertiser_name', 'price', dateFunction, 'name']
					)
				});
			}
		});
	}

	render() {
		const selectedItemsIds = this.state.selectedItems.map(promoItem => {
			return promoItem.merchant_id;
		});
		const noSelectedItems = this.state.selectedItems.length === 0;

		return (
			<div>
				<div className="form-group">
					<MakeManyInvoicesBtn merchantIds={selectedItemsIds} disabled={noSelectedItems}/>
				</div>
				<table className="table table-striped">
					<thead>
						<tr>
							<th>
								<input type="checkbox" checked={this.state.allSelected} onChange={this.handleSelectAll}/>
							</th>
							<th>Дата</th>
							<th>Юридическое лицо</th>
							<th>Магазин</th>
							<th>Пакет</th>
							<th>Сумма</th>
							<th>&nbsp;</th>
						</tr>
					</thead>
					<tbody>
						{this.state.data.map(promoItem => {
							const itemIsSelected = (this.state.selectedItems.indexOf(promoItem.id) >= 0);

							return (
								<PromoItem data={promoItem} selected={itemIsSelected} key={promoItem.id}/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
}
