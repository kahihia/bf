/* global document jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import Icon from '../components/icon.jsx';
import CustomPromoRequestForm from './custom-promo-request-form.jsx';

const className = 'vip-promo';

const VipPromo = React.createClass({
	handleClick() {
		this.openCustomPromoRequestModal();
	},

	openCustomPromoRequestModal() {
		jQuery('.modal').modal('hide');
		jQuery('#custom-promo-request-modal').modal('show');
		const onSubmit = () => {
			jQuery('#custom-promo-request-modal').modal('hide');
		};
		ReactDOM.render(
			<CustomPromoRequestForm
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('custom-promo-request-form')
		);
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
