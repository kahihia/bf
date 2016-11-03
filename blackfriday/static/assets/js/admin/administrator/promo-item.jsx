/* global moment */

import React from 'react';
import Price from 'react-price';
import {formatPrice} from '../utils.js';
import MakeInvoiceBtn from './make-invoice-btn.jsx';
import {promoActions} from './promo-list.jsx';

class PromoItem extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: props.data,
			selected: props.selected
		};

		this.handleSelect = this.handleSelect.bind(this);
		this.onAllSelected = this.onAllSelected.bind(this);
		this.onAllUnselected = this.onAllUnselected.bind(this);

		promoActions.onAllSelected(this.onAllSelected);

		promoActions.onAllUnselected(this.onAllUnselected);
	}

	onAllSelected() {
		this.setState({
			selected: true
		});
	}

	onAllUnselected() {
		this.setState({
			selected: false
		});
	}

	handleSelect() {
		this.setState({
			selected: !this.state.selected
		}, function () {
			if (this.state.selected) {
				promoActions.itemSelected(this.state.data.id);
			} else {
				promoActions.itemUnselected(this.state.data.id);
			}
		});
	}

	render() {
		const dateCreated = (this.state.data.is_custom && this.state.data.created_at) ?
			moment(this.state.data.created_at).format('DD.MM.YYYY') :
			null;

		const makeInvoiceBtn = (
			<MakeInvoiceBtn
				merchantId={this.state.data.merchant_id}
				done={this.state.data.invoice_status_name}
				successMsg="Счёт выставлен"
				/>
		);

		return (
			<tr className={this.state.data.is_custom ? '' : 'active'}>
				<td>
					{
						this.state.data.is_custom ?
							(<input type="checkbox" checked={this.state.selected} onChange={this.handleSelect}/>) :
							null
					}
				</td>
				<td>
					{this.state.data.is_custom ? dateCreated : null}
				</td>
				<td>
					{this.state.data.advertiser_name || ''}
				</td>
				<td>
					{this.state.data.merchant_name || ''}
				</td>
				<td>
					{this.state.data.name}
				</td>
				<td>
					<Price cost={formatPrice(this.state.data.price)} currency={'₽'}/>
				</td>
				<td className="text-right">
					{this.state.data.is_custom ? makeInvoiceBtn : null}
				</td>
			</tr>
		);
	}
}

PromoItem.propTypes = {
	data: React.PropTypes.object,
	selected: React.PropTypes.bool
};
PromoItem.defaultProps = {
	selected: false
};

export default PromoItem;
