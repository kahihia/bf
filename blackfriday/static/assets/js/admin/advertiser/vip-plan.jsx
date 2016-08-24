/* global jQuery */

import React from 'react';
import Icon from '../components/icon.jsx';

const VipPlan = React.createClass({
	handleClick() {
		const modal = jQuery('#urModal');
		modal.modal('show');
	},

	render() {
		return (
			<div className="vip-plan">
				<div className="vip-plan__title">
					<div className="vip-plan__name">
						{'Custom VIP'}
					</div>
				</div>
				<div className="vip-plan__content">
					<Icon name="vip-plan-content"/>
					<span className="vip-plan__desc">
						{'Максимальный трафик, охват, брендинг на КП'}
					</span>
					<button
						className="btn btn-success vip-plan__link"
						onClick={this.handleClick}
						type="button"
						>
						{'Уточнить'}
					</button>
				</div>
			</div>
		);
	}
});

export default VipPlan;
