import React from 'react';
import b from 'b_';
import {hasRole, getUrl} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import Icon from '../components/icon.jsx';
import MerchantProps from './merchant-props.jsx';

const SimpleShopCard = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		onClickMerchantDelete: React.PropTypes.func,
		onClickMerchantHide: React.PropTypes.func
	},

	handleClickMerchantDelete() {
		this.props.onClickMerchantDelete(this.props.data.id);
	},

	handleClickMerchantHide() {
		const {id, isActive} = this.props.data;
		this.props.onClickMerchantHide(id, !isActive);
	},

	render() {
		const {
			id,
			image,
			isActive,
			isPreviewable,
			moderationStatus,
			name,
			optionsCount,
			paymentStatus,
			previewUrl,
			promo,
			receivesNotifications
		} = this.props.data;

		const editUrl = `${getUrl('merchants')}${id}/`;
		const isAdmin = hasRole('admin');
		const isAdvertiser = hasRole('advertiser');
		const className = 'simple-shop-card';

		return (
			<div className={b(className)}>
				<span className={b(className, 'logo-placeholder')}>
					{image ? (
						<img
							className={b(className, 'logo')}
							src={image.url}
							alt=""
							/>
					) : null}
				</span>

				<div
					className={b(className, 'name')}
					title={name}
					>
					{name}
				</div>

				<MerchantProps
					{...{
						id,
						moderationStatus,
						optionsCount,
						paymentStatus,
						promo,
						receivesNotifications
					}}
					/>

				<div className={b(className, 'action-list')}>
					<div className={b('action-list')}>
						{isAdmin || isAdvertiser ? (
							<a
								className={b('action-list', 'item')}
								href={editUrl}
								title="Редактирование"
								>
								<Icon name="shop-edit"/>
							</a>
						) : null}

						{isPreviewable && previewUrl ? (
							<a
								className={b('action-list', 'item')}
								href={previewUrl}
								target="_blank"
								rel="noopener noreferrer"
								title="Предпросмотр"
								>
								<Icon name="shop-preview"/>
							</a>
						) : null}

						{isAdmin ? (
							<span
								className={b('action-list', 'item')}
								title={isActive ? 'Скрыть загруженный контент' : 'Показывать загруженный контент'}
								onClick={this.handleClickMerchantHide}
								>
								<Glyphicon
									name="eye-close"
									className={isActive ? 'text-muted' : 'text-danger'}
									/>
							</span>
						) : (
							<span
								className={b('action-list', 'item')}
								title={isActive ? 'Активен' : 'Не активен'}
								>
								<Glyphicon
									name="eye-close"
									className={isActive ? 'text-muted' : 'text-danger'}
									/>
							</span>
						)}

						{isAdmin ? (
							<span
								className={b('action-list', 'item')}
								onClick={this.handleClickMerchantDelete}
								title="Удалить магазин"
								>
								<Glyphicon
									name="remove"
									className="text-danger"
									/>
							</span>
						) : null}
					</div>
				</div>
			</div>
		);
	}
});

export default SimpleShopCard;
