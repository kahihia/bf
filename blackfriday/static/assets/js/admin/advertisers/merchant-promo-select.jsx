import React from 'react';
import {hasRole} from '../utils.js';
import Icon from '../components/icon.jsx';
import VipPromo from './vip-promo.jsx';
import PromoTable from './promo-table.jsx';

const MerchantPromoSelect = React.createClass({
	propTypes: {
		promos: React.PropTypes.array,
		activePromoId: React.PropTypes.number,
		onChangePromo: React.PropTypes.func
	},

	handleChangePromo(promoId) {
		this.props.onChangePromo(promoId);
	},

	render() {
		const {activePromoId, promos} = this.props;
		const isAdvertiser = hasRole('advertiser');

		return (
			<div>
				<h2>
					{'Рекламные пакеты '}

					<small>
						<a
							className="download-file"
							href="/com_offer"
							target="_blank"
							rel="noopener noreferrer"
							>
							<Icon name="file-pdf"/>

							<span className="download-file__name">
								{'Скачать презентацию'}
							</span>

							<span className="download-file__size">
								{'(3,9 MB)'}
							</span>
						</a>
					</small>
				</h2>

				<div className="promo-chooser">
					<div className="promo-chooser__regular">
						<PromoTable
							onChangePromo={this.handleChangePromo}
							{...{
								activePromoId,
								promos
							}}
							/>
					</div>

					<div className="promo-chooser__vip">
						{isAdvertiser ? (
							<VipPromo/>
						) : null}
					</div>
				</div>
			</div>
		);
	}
});

export default MerchantPromoSelect;
