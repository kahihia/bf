/* global jQuery */

import React from 'react';
import b from 'b_';
import Icon from '../components/icon.jsx';

const className = 'vip-promo';

const VipPromo = React.createClass({
	handleClick() {
		const modal = jQuery('#urModal');
		modal.modal('show');
	},

	render() {
		return (
			<div className={className}>
				<div className={b(className, 'title')}>
					<div className={b(className, 'name')}>
						{'Custom VIP'}
					</div>
				</div>

				<div className={b(className, 'content')}>
					<Icon name="vip-promo-content"/>

					<span className={b(className, 'desc')}>
						{'Максимальный трафик, охват, брендинг на КП'}
					</span>

					<button
						className={'btn btn-success ' + b(className, 'link')}
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

export default VipPromo;
