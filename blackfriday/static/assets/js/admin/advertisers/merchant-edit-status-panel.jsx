/* eslint react/require-optimization: 0 */

import React from 'react';
import b from 'b_';
import {PAYMENT_STATUS, MODERATION_STATUS} from '../const.js';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const className = 'merchant-edit-status-panel';

class MerchantEditStatusPanel extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};
	}

	render() {
		const {
			isPreviewable,
			previewUrl,
			paymentStatus,
			moderationComment,
			moderationStatus
		} = this.props;

		return (
			<div className={className}>
				<div className={b(className, 'data')}>
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
								{moderationComment ? (
									<span>
										<Popover
											className="text-danger"
											title="Комментарий модератора"
											content={moderationComment}
											>
											<Glyphicon name="warning-sign"/>
										</Popover>

										{' '}
									</span>
								) : null}

								<span className={moderationStatus === 2 ? 'text-success' : 'text-danger'}>
									{moderationStatus === 2 ? (
										<Glyphicon name="ok"/>
									) : (
										<Glyphicon name="remove"/>
									)}

									{' '}

									{MODERATION_STATUS[moderationStatus]}
								</span>
							</span>
						</li>
					</ul>
				</div>

				<div className={b(className, 'action')}>
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
				</div>
			</div>
		);
	}
}
MerchantEditStatusPanel.propTypes = {
	isPreviewable: React.PropTypes.bool,
	previewUrl: React.PropTypes.string,
	paymentStatus: React.PropTypes.number,
	moderationStatus: React.PropTypes.number,
	moderationComment: React.PropTypes.string
};
MerchantEditStatusPanel.defaultProps = {
};

export default MerchantEditStatusPanel;
