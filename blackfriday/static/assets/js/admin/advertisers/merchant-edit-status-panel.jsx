/* eslint react/require-optimization: 0 */

import React from 'react';
import b from 'b_';
import {PAYMENT_STATUS, MODERATION_STATUS, ADVERTISER_IS_SUPERNOVA} from '../const.js';
import {hasRole, getCssClassForModerationStatus} from '../utils.js';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const className = 'merchant-edit-status-panel';

class MerchantEditStatusPanel extends React.Component {
	constructor(props) {
		super(props);
		this.handleClickDelete = this.handleClickDelete.bind(this);
		this.handleClickModeration = this.handleClickModeration.bind(this);
		this.handleClickPromoSelect = this.handleClickPromoSelect.bind(this);
		this.handleClickPromoOptionsSelect = this.handleClickPromoOptionsSelect.bind(this);
	}

	handleClickDelete() {
		this.props.onClickDelete();
	}

	handleClickModeration() {
		this.props.onClickModeration();
	}

	handleClickPromoSelect() {
		this.props.onClickPromoSelect();
	}

	handleClickPromoOptionsSelect() {
		this.props.onClickPromoOptionsSelect();
	}

	render() {
		const {
			isPreviewable,
			moderationComment,
			moderationStatus,
			optionsCount,
			paymentStatus,
			previewUrl,
			promoName
		} = this.props;
		const isAdmin = hasRole('admin');
		const moderationCssClass = getCssClassForModerationStatus(moderationStatus);

		return (
			<div className={className}>
				<div className={b(className, 'data')}>
					<ul className="props">
						<li className="props__item">
							<span className="props__label">
								{'Рекламный пакет: '}
							</span>

							<span className="props__value">
								{promoName}
							</span>

							{ADVERTISER_IS_SUPERNOVA ? null : (
								<EditButton onClick={this.handleClickPromoSelect}/>
							)}
						</li>

						<li className="props__item">
							<span className="props__label">
								{'Дополнительные опции: '}
							</span>

							<span className="props__value">
								{optionsCount}
							</span>

							{ADVERTISER_IS_SUPERNOVA ? null : (
								<EditButton onClick={this.handleClickPromoOptionsSelect}/>
							)}
						</li>
					</ul>

					<ul className="props">
						<li className="props__item">
							<span className="props__label">
								{'Статус оплаты: '}
							</span>

							<span className="props__value">
								{PAYMENT_STATUS[paymentStatus]}
							</span>
						</li>

						<li className="props__item">
							<span className="props__label">
								{'Статус модерации: '}
							</span>

							<span className="props__value">
								<span className={moderationCssClass}>
									{MODERATION_STATUS[moderationStatus]}
								</span>

								{((moderationStatus === 2) || (moderationStatus === 3)) && moderationComment ? (
									<Popover
										title="Комментарий модератора"
										content={moderationComment}
										>
										<Glyphicon
											name="comment"
											style={{marginLeft: 3}}
											/>
									</Popover>
								) : null}
							</span>
						</li>
					</ul>
				</div>

				<div className={b(className, 'action')}>
					{isAdmin ? (
						<button
							className="btn btn-danger"
							onClick={this.handleClickDelete}
							type="button"
							>
							{'Удалить'}
						</button>
					) : null}

					{isPreviewable ? (
						<a
							className="btn btn-default"
							href={previewUrl}
							target="_blank"
							rel="noopener noreferrer"
							>
							{'Предпросмотр'}
						</a>
					) : null}

					<button
						className="btn btn-primary"
						onClick={this.handleClickModeration}
						type="button"
						>
						{'Отправить на модерацию'}
					</button>
				</div>
			</div>
		);
	}
}
MerchantEditStatusPanel.propTypes = {
	isPreviewable: React.PropTypes.bool,
	moderationComment: React.PropTypes.string,
	moderationStatus: React.PropTypes.number,
	onClickDelete: React.PropTypes.func,
	onClickModeration: React.PropTypes.func.isRequired,
	onClickPromoOptionsSelect: React.PropTypes.func.isRequired,
	onClickPromoSelect: React.PropTypes.func.isRequired,
	optionsCount: React.PropTypes.number,
	paymentStatus: React.PropTypes.number,
	previewUrl: React.PropTypes.string,
	promoName: React.PropTypes.string
};
MerchantEditStatusPanel.defaultProps = {
};

export default MerchantEditStatusPanel;

const EditButton = props => (
	<span
		className="props__link"
		onClick={props.onClick}
		>
		<Glyphicon name="pencil"/>
	</span>
);
EditButton.propTypes = {
	onClick: React.PropTypes.func.isRequired
};
// EditButton.defaultProps = {};
