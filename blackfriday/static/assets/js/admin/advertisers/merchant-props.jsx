/* eslint react/require-optimization: 0 */

import React from 'react';
import {MODERATION_STATUS, PAYMENT_STATUS} from '../const.js';
import {getUrl, hasRole, getCssClassForModerationStatus} from '../utils.js';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

class MerchantProps extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			id,
			moderation,
			optionsCount,
			paymentStatus,
			promo,
			receivesNotifications
		} = this.props;

		const isAdmin = hasRole('admin');
		const isAdvertiser = hasRole('advertiser');

		const isCanceled = paymentStatus === 2;

		let promoName = promo && promo.name;
		const isAllowPromoSelect = (!promoName || isCanceled) && (isAdmin || isAdvertiser);
		promoName = isAllowPromoSelect ? 'Выберите пакет' : promoName;

		const editUrl = `${getUrl('merchants')}${id}/`;

		const moderationCssClass = getCssClassForModerationStatus(moderation.status);

		return (
			<ul className="props merchant-props">
				<li className="props__item">
					<span className="props__label">
						{'Пакет:'}
					</span>

					<span
						className="props__value"
						title={promoName}
						>
						{isAllowPromoSelect ? (
							<a href={`${editUrl}#promo`}>
								{promoName}
							</a>
						) : promoName || 'Не выбран'}
					</span>
				</li>

				<li className="props__item">
					<span className="props__label">
						{'Статус оплаты:'}
					</span>

					<span className="props__value">
						<a href={`${getUrl('invoices')}#invoice${id}`}>
							{PAYMENT_STATUS[paymentStatus]}
						</a>
					</span>
				</li>

				<li className="props__item">
					<span className="props__label">
						{'Модерация:'}
					</span>

					<span className="props__value">
						<span className={moderationCssClass}>
							{MODERATION_STATUS[moderation.status]}
						</span>

						{moderation && ((moderation.status === 2) || (moderation.status === 3)) && moderation.comment ? (
							<Popover
								title="Комментарий модератора"
								content={moderation.comment}
								>
								<Glyphicon
									name="comment"
									style={{marginLeft: 3}}
									/>
							</Popover>
						) : null}
					</span>
				</li>

				{isCanceled || optionsCount ? (
					<li className="props__item">
						<span className="props__label">
							{'Доп. опции:'}
						</span>

						<span className="props__value">
							{isCanceled ? (
								<a href={`${editUrl}#promo`}>
									{optionsCount}
								</a>
							) : optionsCount}
						</span>
					</li>
				) : null}

				<li className="props__item">
					<span className="props__label">
						{'Почтовые уведомления:'}
					</span>

					<span className="props__value">
						<Glyphicon
							name={receivesNotifications ? 'ok' : 'remove'}
							className={receivesNotifications ? 'text-success' : 'text-danger'}
							style={{marginRight: 3}}
							/>
					</span>
				</li>
			</ul>
		);
	}
}
MerchantProps.propTypes = {
	id: React.PropTypes.number,
	moderation: React.PropTypes.object,
	optionsCount: React.PropTypes.number,
	paymentStatus: React.PropTypes.number,
	promo: React.PropTypes.object,
	receivesNotifications: React.PropTypes.bool
};
MerchantProps.defaultProps = {
};

export default MerchantProps;
