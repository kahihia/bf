/* global React */

import {resolveImgPath, hasRole} from '../utils.js';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const SimpleShopCard = React.createClass({
	propTypes: {
		data: React.PropTypes.object.isRequired,
		onClickHideContent: React.PropTypes.func
	},

	handleClickHideContent() {
		if (!this.props.onClickHideContent) {
			return;
		}

		this.props.onClickHideContent(this.props.data.id, !this.props.data.merchant_active);
	},

	render() {
		const item = this.props.data;
		const isEditable = item.editable || hasRole('admin');
		const isCanceled = item.invoice_status === 'canceled';
		const isAllowPlanSelect = !item.promo_name;
		const planName = isAllowPlanSelect ? 'Выберите тариф' : item.promo_name;

		return (
			<div className="simple-shop-card">
				{isEditable ? (
					<a href={`/admin/merchant/${item.id}`}>
						{item.logo ? (
							<img
								className="simple-shop-card__logo"
								src={resolveImgPath(item.logo)}
								alt=""
								/>
						) : null}

						<div
							className="simple-shop-card__name"
							title={item.merchant_name}
							>
							{item.merchant_name}
						</div>
					</a>
				) : (
					<div>
						{item.logo ? (
							<img
								className="simple-shop-card__logo"
								src={resolveImgPath(item.logo)}
								alt=""
								/>
						) : null}

						<div
							className="simple-shop-card__name"
							title={item.merchant_name}
							>
							{item.merchant_name}
						</div>
					</div>
				)}

				<ul className="props simple-shop-card__props">
					<li className="props__item">
						<span className="props__label">
							{'Тарифный план:'}
						</span>

						<span
							className="props__value"
							title={item.promo_name}
							>
							{isEditable || isCanceled || isAllowPlanSelect ? (
								<a href={`/admin/merchant/${item.id}#plan`}>
									{planName}
								</a>
							) : planName}
						</span>
					</li>

					{isCanceled || (!item.options_num && item.options_num !== 0) ? null : (
						<li className="props__item">
							<span className="props__label">
								{'Доп. опции:'}
							</span>
							<span className="props__value">
								{isEditable || item.invoice_status === 'canceled' ? (
									<a href={`/admin/merchant/${item.id}#plan`}>
										{item.options_num}
									</a>
								) : (
									item.options_num
								)}
							</span>
						</li>
					)}

					{item.invoice_status_name ? (
						<li className="props__item">
							<span className="props__label">
								{'Статус оплаты:'}
							</span>
							<span className="props__value">
								<a href={`/admin/merchant/invoices#invoice${item.invoice_id}`}>
									{item.invoice_status_name}
								</a>
							</span>
						</li>
					) : null}

					<li className="props__item">
						<span className="props__label">
							{'Материалы:'}
						</span>
						<span className="props__value">
							{item.moderation_comment ? (
								<Popover
									className="text-danger"
									title="Комментарий модератора"
									content={item.moderation_comment}
									>
									<Glyphicon
										name="warning-sign"
										style={{marginRight: 3}}
										/>
								</Popover>
							) : null}
							{item.invoice_status === 'waiting' && !item.moderation_comment ? (
								<Popover
									className="text-warning"
									content="Загрузка материалов возможна после оплаты"
									>
									<Glyphicon
										name="warning-sign"
										style={{marginRight: 3}}
										/>
								</Popover>
							) : null}
							{item.moderation_status_name}
						</span>
					</li>
				</ul>

				<div className="action-list simple-shop-card__action-list">
					{isEditable ? (
						<a
							className="action-list__item"
							href={`/admin/merchant/${item.id}`}
							title="Редактирование"
							>
							<i className="icon icon_name_shop-edit"/>
						</a>
					) : null}

					{item.previewable ? (
						<a
							className="action-list__item"
							href={`/admin/merchant/${item.id}/preview`}
							target="_blank"
							rel="noopener noreferrer"
							title="Предпросмотр"
							>
							<i className="icon icon_name_shop-preview"/>
						</a>
					) : null}

					{hasRole('admin') ? (
						<span
							className="action-list__item"
							title={item.merchant_active ? 'Скрыть загруженный контент' : 'Показывать загруженный контент'}
							onClick={this.handleClickHideContent}
							>
							<Glyphicon
								name="eye-close"
								className={item.merchant_active ? 'text-muted' : 'text-danger'}
								/>
						</span>
					) : null}
				</div>
			</div>
		);
	}
});

export default SimpleShopCard;
