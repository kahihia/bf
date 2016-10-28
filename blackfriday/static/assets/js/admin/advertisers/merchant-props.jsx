/* eslint react/require-optimization: 0 */

import React from 'react';
import {MODERATION_STATUS, PAYMENT_STATUS} from '../const.js';
import {getUrl, hasRole} from '../utils.js';
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
						<span title={MODERATION_STATUS[moderation.status]}>
							{moderation.status === 2 ? (
								<Glyphicon
									name="ok"
									className="text-success"
									/>
							) : (
								<Glyphicon
									name="remove"
									className="text-danger"
									/>
							)}
						</span>
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
						{'Материалы:'}
					</span>

					<span className="props__value">
						{moderation && moderation.comment ? (
							<Popover
								className="text-danger"
								title="Комментарий модератора"
								content={moderation.comment}
								>
								<Glyphicon
									name="warning-sign"
									style={{marginRight: 3}}
									/>
							</Popover>
						) : null}

						{paymentStatus === 0 && !(moderation && moderation.comment) ? (
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

						{MODERATION_STATUS[moderation.status]}
					</span>
				</li>

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
