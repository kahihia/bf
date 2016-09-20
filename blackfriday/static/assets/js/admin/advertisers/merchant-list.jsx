import React from 'react';
import b from 'b_';
import {hasRole} from '../utils.js';
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
		const {merchants} = this.props;

		return (
			<div className={b('merchant-list')}>
				<table className={'table table-hover ' + b('merchant-list', 'table')}>
					<thead>
						<tr>
							<th className={b('merchant-list', 'table-th', {name: 'logo'})}>
								{'Логотип'}
							</th>

							<th className={b('merchant-list', 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b('merchant-list', 'table-th', {name: 'advertiser'})}>
								{'Рекламодатель'}
							</th>

							<th className={b('merchant-list', 'table-th', {name: 'data'})}>
								{'Данные'}
							</th>

							<th className={b('merchant-list', 'table-th', {name: 'action'})}/>
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
					</tbody>
				</table>
			</div>
		);
	}
}
MerchantList.propTypes = {
	merchants: React.PropTypes.array,
	onClickMerchantDelete: React.PropTypes.func,
	onClickMerchantHide: React.PropTypes.func
};
MerchantList.defaultProps = {
};

export default MerchantList;

const MerchantListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		image: React.PropTypes.string,
		isActive: React.PropTypes.bool,
		isEditable: React.PropTypes.bool,
		isPreviewable: React.PropTypes.bool,
		link: React.PropTypes.string,
		moderation: React.PropTypes.object,
		moderationStatus: React.PropTypes.number,
		name: React.PropTypes.string,
		onClickMerchantDelete: React.PropTypes.func,
		onClickMerchantHide: React.PropTypes.func,
		optionsCount: React.PropTypes.number,
		paymentStatus: React.PropTypes.number,
		previewUrl: React.PropTypes.string,
		promo: React.PropTypes.string
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
			id,
			image,
			isActive,
			isEditable,
			isPreviewable,
			link,
			moderationStatus,
			name,
			optionsCount,
			paymentStatus,
			previewUrl,
			promo
		} = this.props;

		return (
			<tr>
				<td className={b('merchant-list', 'table-td', {name: 'logo'})}>
					<a href={link}>
						<span className={b('merchant-list', 'logo-placeholder')}>
							{image ? (
								<img
									src={image}
									alt=""
									/>
							) : null}
						</span>
					</a>
				</td>

				<td className={b('merchant-list', 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b('merchant-list', 'table-td', {name: 'advertiser'})}>
					{'advertiser'}
				</td>

				<td className={b('merchant-list', 'table-td', {name: 'data'})}>
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
				</td>

				<td className={b('merchant-list', 'table-td', {name: 'action'})}>
					{isEditable ? (
						<a
							className="btn btn-default btn-sm"
							href={`/admin/merchants/${id}/`}
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

					{hasRole('admin') ? (
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

					<button
						className="btn btn-danger btn-sm"
						onClick={this.handleClickMerchantDelete}
						title="Удалить магазин"
						type="button"
						>
						<Glyphicon name="remove"/>
					</button>
				</td>
			</tr>
		);
	}
});
