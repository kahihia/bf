import React from 'react';
import b from 'b_';
import {hasRole, getUrl} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import MerchantProps from './merchant-props.jsx';

class MerchantList extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickMerchantDelete = this.handleClickMerchantDelete.bind(this);
		this.handleClickMerchantHide = this.handleClickMerchantHide.bind(this);
	}

	handleClickMerchantDelete(merchantId) {
		this.props.onClickMerchantDelete(merchantId);
	}

	handleClickMerchantHide(merchantId, isActive) {
		this.props.onClickMerchantHide(merchantId, isActive);
	}

	render() {
		const {merchants, isLoading} = this.props;
		const className = 'merchant-list';

		let listStatus = null;

		if (!merchants.length) {
			if (isLoading) {
				listStatus = 'Загрузка...';
			} else {
				listStatus = 'Магазины отсутствуют';
			}
		}

		const statusRow = (
			<tr>
				<td
					colSpan="5"
					className="text-center text-muted"
					>
					{listStatus}
				</td>
			</tr>
		);

		return (
			<div className={b(className)}>
				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'logo'})}>
								{'Логотип'}
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b(className, 'table-th', {name: 'advertiser'})}>
								{'Рекламодатель'}
							</th>

							<th className={b(className, 'table-th', {name: 'data'})}>
								{'Данные'}
							</th>

							<th className={b(className, 'table-th', {name: 'action'})}/>
						</tr>
					</thead>

					<tbody>
						{merchants.map(item => {
							return (
								<MerchantListItem
									key={item.id}
									onClickMerchantDelete={this.handleClickMerchantDelete}
									onClickMerchantHide={this.handleClickMerchantHide}
									{...item}
									/>
							);
						})}

						{listStatus ? statusRow : null}
					</tbody>
				</table>
			</div>
		);
	}
}
MerchantList.propTypes = {
	merchants: React.PropTypes.array,
	isLoading: React.PropTypes.bool,
	onClickMerchantDelete: React.PropTypes.func,
	onClickMerchantHide: React.PropTypes.func
};
MerchantList.defaultProps = {
};

export default MerchantList;

const MerchantListItem = React.createClass({
	propTypes: {
		advertiser: React.PropTypes.object,
		id: React.PropTypes.number,
		image: React.PropTypes.object,
		isActive: React.PropTypes.bool,
		isPreviewable: React.PropTypes.bool,
		moderation: React.PropTypes.object,
		name: React.PropTypes.string,
		onClickMerchantDelete: React.PropTypes.func,
		onClickMerchantHide: React.PropTypes.func,
		optionsCount: React.PropTypes.number,
		paymentStatus: React.PropTypes.number,
		previewUrl: React.PropTypes.string,
		promo: React.PropTypes.object,
		receivesNotifications: React.PropTypes.bool
	},

	getDefaultProps() {
		return {};
	},

	handleClickMerchantDelete() {
		this.props.onClickMerchantDelete(this.props.id);
	},

	handleClickMerchantHide() {
		this.props.onClickMerchantHide(this.props.id, !this.props.isActive);
	},

	render() {
		const {
			advertiser,
			id,
			image,
			isActive,
			isPreviewable,
			moderation,
			name,
			optionsCount,
			paymentStatus,
			previewUrl,
			promo,
			receivesNotifications
		} = this.props;

		const editUrl = `${getUrl('merchants')}${id}/`;
		const isAdmin = hasRole('admin');
		const isAdvertiser = hasRole('advertiser');
		const className = 'merchant-list';

		return (
			<tr>
				<td className={b(className, 'table-td', {name: 'logo'})}>
					<span className={b(className, 'logo-placeholder')}>
						{image ? (
							<img
								src={image.url}
								alt=""
								/>
						) : null}
					</span>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b(className, 'table-td', {name: 'advertiser'})}>
					{advertiser.name}
				</td>

				<td className={b(className, 'table-td', {name: 'data'})}>
					<MerchantProps
						{...{
							id,
							moderation,
							optionsCount,
							paymentStatus,
							promo,
							receivesNotifications
						}}
						/>
				</td>

				<td className={b(className, 'table-td', {name: 'action'})}>
					{isAdmin || isAdvertiser ? (
						<a
							className="btn btn-default btn-sm"
							href={editUrl}
							title="Редактирование"
							>
							<Glyphicon name="pencil"/>
						</a>
					) : null}

					{isPreviewable && previewUrl ? (
						<a
							className="btn btn-sm"
							href={previewUrl}
							target="_blank"
							rel="noopener noreferrer"
							title="Предпросмотр"
							>
							<Glyphicon name="eye-open"/>
						</a>
					) : null}

					{isAdmin ? (
						<button
							className="btn btn-sm"
							onClick={this.handleClickMerchantHide}
							title={isActive ? 'Скрыть загруженный контент' : 'Показывать загруженный контент'}
							type="button"
							>
							<Glyphicon
								name="eye-close"
								className={isActive ? 'text-muted' : 'text-danger'}
								/>
						</button>
					) : (
						<span
							className="btn btn-sm"
							title={isActive ? 'Активен' : 'Не активен'}
							>
							<Glyphicon
								name="eye-close"
								className={isActive ? 'text-muted' : 'text-danger'}
								/>
						</span>
					)}

					{isAdmin ? (
						<button
							className="btn btn-danger btn-sm"
							onClick={this.handleClickMerchantDelete}
							title="Удалить магазин"
							type="button"
							>
							<Glyphicon name="remove"/>
						</button>
					) : null}
				</td>
			</tr>
		);
	}
});
