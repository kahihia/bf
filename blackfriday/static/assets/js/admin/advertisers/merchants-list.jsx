import React from 'react';
import b from 'b_';
import {hasRole} from '../utils.js';
import Glyphicon from '../components/glyphicon.jsx';
import MerchantProps from './merchant-props.jsx';

class MerchantsList extends React.Component {
	constructor(props) {
		super(props);

		this.handleClickMerchantDelete = this.handleClickMerchantDelete.bind(this);
		this.handleClickMerchantEdit = this.handleClickMerchantEdit.bind(this);
		this.handleClickMerchantHide = this.handleClickMerchantHide.bind(this);
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

		return (
			<div className={b('merchants-list')}>
				<table className={'table table-hover ' + b('merchants-list', 'table')}>
					<thead>
						<tr>
							<th className={b('merchants-list', 'table-th', {name: 'logo'})}>
								{'Логотип'}
							</th>

							<th className={b('merchants-list', 'table-th', {name: 'name'})}>
								{'Название'}
							</th>

							<th className={b('merchants-list', 'table-th', {name: 'advertiser'})}>
								{'Рекламодатель'}
							</th>

							<th className={b('merchants-list', 'table-th', {name: 'data'})}>
								{'Данные'}
							</th>

							<th className={b('merchants-list', 'table-th', {name: 'action'})}/>
						</tr>
					</thead>

					<tbody>
						{merchants.map(item => {
							return (
								<MerchantsListItem
									key={item.id}
									onClickMerchantDelete={this.handleClickMerchantDelete}
									onClickMerchantEdit={this.handleClickMerchantEdit}
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
MerchantsList.propTypes = {
	merchants: React.PropTypes.array,
	onClickMerchantDelete: React.PropTypes.func,
	onClickMerchantEdit: React.PropTypes.func,
	onClickMerchantHide: React.PropTypes.func
};
MerchantsList.defaultProps = {
};

export default MerchantsList;

const MerchantsListItem = React.createClass({
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
		onClickMerchantEdit: React.PropTypes.func,
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

	handleClickMerchantEdit() {
		this.props.onClickMerchantEdit(this.props.id);
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
				<td className={b('merchants-list', 'table-td', {name: 'logo'})}>
					<a href={link}>
						<span className={b('merchants-list', 'logo-placeholder')}>
							{image ? (
								<img
									src={image}
									alt=""
									/>
							) : null}
						</span>
					</a>
				</td>

				<td className={b('merchants-list', 'table-td', {name: 'name'})}>
					{name}
				</td>

				<td className={b('merchants-list', 'table-td', {name: 'advertiser'})}>
					{'advertiser'}
				</td>

				<td className={b('merchants-list', 'table-td', {name: 'data'})}>
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

				<td className={b('merchants-list', 'table-td', {name: 'action'})}>
					{isEditable ? (
						<button
							className="btn btn-sm"
							onClick={this.handleClickMerchantEdit}
							title="Редактирование"
							type="button"
							>
							<Glyphicon name="pencil"/>
						</button>
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
					) : null}

					<button
						className="btn btn-sm"
						onClick={this.handleClickMerchantDelete}
						title="Удалить магазин"
						type="button"
						>
						<Glyphicon
							name="remove"
							className="text-danger"
							/>
					</button>
				</td>
			</tr>
		);
	}
});
