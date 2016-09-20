import React from 'react';
import b from 'b_';
import {resolveImgPath, hasRole} from '../utils.js';
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
		const item = this.props.data;
		const {
			id,
			moderationStatus,
			optionsCount,
			paymentStatus,
			promo
		} = item;

		const isAdmin = hasRole('admin');
		const isEditable = item.editable || isAdmin;

		return (
			<div className={b('simple-shop-card')}>
				{isEditable ? (
					<a href={`/admin/merchant/${item.id}`}>
						<span className={b('simple-shop-card', 'logo-placeholder')}>
							{item.image ? (
								<img
									className={b('simple-shop-card', 'logo')}
									src={resolveImgPath(item.image)}
									alt=""
									/>
							) : null}
						</span>

						<div
							className={b('simple-shop-card', 'name')}
							title={item.name}
							>
							{item.name}
						</div>
					</a>
				) : (
					<div>
						{item.image ? (
							<img
								className={b('simple-shop-card', 'logo')}
								src={resolveImgPath(item.image)}
								alt=""
								/>
						) : null}

						<div
							className={b('simple-shop-card', 'name')}
							title={item.name}
							>
							{item.name}
						</div>
					</div>
				)}

				<MerchantProps
					{...{
						id,
						isEditable,
						moderationStatus,
						optionsCount,
						paymentStatus,
						promo
					}}
					/>

				<div className={b('simple-shop-card', 'action-list')}>
					<div className={b('action-list')}>
						{isEditable ? (
							<a
								className={b('action-list', 'item')}
								href={`/admin/merchants/${id}/`}
								title="Редактирование"
								>
								<Icon name="shop-edit"/>
							</a>
						) : null}

						{item.isPreviewable && item.previewUrl ? (
							<a
								className={b('action-list', 'item')}
								href={item.previewUrl}
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
								title={item.isActive ? 'Скрыть загруженный контент' : 'Показывать загруженный контент'}
								onClick={this.handleClickMerchantHide}
								>
								<Glyphicon
									name="eye-close"
									className={item.isActive ? 'text-muted' : 'text-danger'}
									/>
							</span>
						) : (
							<span
								className={b('action-list', 'item')}
								title={item.isActive ? 'Активен' : 'Не активен'}
								>
								<Glyphicon
									name="eye-close"
									className={item.isActive ? 'text-muted' : 'text-danger'}
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
