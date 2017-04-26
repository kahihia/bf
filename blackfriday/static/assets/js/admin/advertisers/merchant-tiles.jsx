import React from 'react';
import b from 'b_';
import {hasRole} from '../utils.js';
import {ADVERTISER_IS_SUPERNOVA} from '../const.js';
import Icon from '../components/icon.jsx';
import SimpleShopCard from './simple-shop-card.jsx';

class MerchantList extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickMerchantAdd = this.handleClickMerchantAdd.bind(this);
		this.handleClickMerchantDelete = this.handleClickMerchantDelete.bind(this);
		this.handleClickMerchantHide = this.handleClickMerchantHide.bind(this);
	}

	handleClickMerchantAdd(e) {
		e.preventDefault();
		this.props.onClickMerchantAdd();
	}

	handleClickMerchantDelete(merchantId) {
		this.props.onClickMerchantDelete(merchantId);
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
				{isAdmin || (isAdvertiser && !ADVERTISER_IS_SUPERNOVA) ? (
					<div className={b('merchant-shop-card-list', 'item')}>
						<button
							className={b('merchant-add-shop')}
							onClick={this.handleClickMerchantAdd}
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
								onClickMerchantHide={this.handleClickMerchantHide}
								/>
						</div>
					);
				})}
			</div>
		);
	}
}
MerchantList.propTypes = {
	merchants: React.PropTypes.array,
	onClickMerchantAdd: React.PropTypes.func,
	onClickMerchantDelete: React.PropTypes.func,
	onClickMerchantHide: React.PropTypes.func
};
MerchantList.defaultProps = {
};

export default MerchantList;
