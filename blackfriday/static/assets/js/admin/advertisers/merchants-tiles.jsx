import React from 'react';
import b from 'b_';
import {hasRole} from '../utils.js';
import Icon from '../components/icon.jsx';
import SimpleShopCard from './simple-shop-card.jsx';

class MerchantsList extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickAdd = this.handleClickAdd.bind(this);
		this.handleClickMerchantDelete = this.handleClickMerchantDelete.bind(this);
		this.handleClickMerchantEdit = this.handleClickMerchantEdit.bind(this);
		this.handleClickMerchantHide = this.handleClickMerchantHide.bind(this);
	}

	handleClickAdd(e) {
		e.preventDefault();
		this.props.onClickAdd();
	}

	handleClickMerchantDelete(merchantId) {
		this.props.onClickMerchantDelete(merchantId);
	}

	handleClickMerchantEdit(merchantId) {
		this.props.onClickMerchantEdit(merchantId);
	}

	handleClickMerchantHide(merchantId, isActive) {
		this.props.onClickMerchantHide(merchantId, isActive);
	}

	render() {
		const {merchants} = this.props;

		const isAdmin = hasRole('admin');
		const isAdvertiser = hasRole('advertiser');

		return (
			<div className={b('merchant-shop-card-list')}>
				{isAdmin || isAdvertiser ? (
					<div className={b('merchant-shop-card-list', 'item')}>
						<button
							className={b('merchant-add-shop')}
							onClick={this.handleClickAdd}
							type="button"
							>
							<Icon name="merchant-add-shop"/>

							<span className={b('merchant-add-shop', 'text')}>
								{'Добавить магазин'}
							</span>
						</button>
					</div>
				) : null}

				{merchants.map(merchant => {
					return (
						<div
							key={merchant.id}
							className={b('merchant-shop-card-list', 'item')}
							>
							<SimpleShopCard
								data={merchant}
								onClickMerchantDelete={this.handleClickMerchantDelete}
								onClickMerchantEdit={this.handleClickMerchantEdit}
								onClickMerchantHide={this.handleClickMerchantHide}
								/>
						</div>
					);
				})}
			</div>
		);
	}
}
MerchantsList.propTypes = {
	merchants: React.PropTypes.array,
	onClickAdd: React.PropTypes.func,
	onClickMerchantDelete: React.PropTypes.func,
	onClickMerchantEdit: React.PropTypes.func,
	onClickMerchantHide: React.PropTypes.func
};
MerchantsList.defaultProps = {
};

export default MerchantsList;
