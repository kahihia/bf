/* global document toastr */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {ENV, hasRole} from './admin/utils.js';
import ControlLabel from './admin/components/control-label.jsx';
import ImagesUpload from './admin/common/images-upload.jsx';
import MerchantEditForm from './admin/advertisers/merchant-edit-form.jsx';
import MerchantPartnersSelect from './admin/advertisers/merchant-partners-select.jsx';
import MerchantEditStatusPanel from './admin/advertisers/merchant-edit-status-panel.jsx';
import MerchantEditPromoSelect from './admin/advertisers/merchant-edit-promo-select.jsx';

(function () {
	'use strict';

	const AdminMerchant = React.createClass({
		getInitialState() {
			return {
				data: {},
				id: null
			};
		},

		componentWillMount() {
			this.setState({id: ENV.merchantId}, this.requestMerchant);
		},

		requestMerchant() {
			xhr({
				url: `/api/merchants/${this.state.id}/`,
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({data});
					}
				} else {
					toastr.error('Не удалось получить данные магазина');
				}
			});
		},

		requestMerchantUploadLogo(image) {
			const json = {image};

			xhr({
				url: `/api/merchants/${this.state.id}/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({data});
					}
				} else {
					toastr.error('Не удалось загрузить логотип магазина');
				}
			});
		},

		requestModeration() {
			const json = {status: 1};

			xhr({
				url: `/api/merchants/${this.state.id}/moderation/`,
				method: 'PATCH',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				},
				json
			}, (err, resp, data) => {
				if (resp.statusCode === 200) {
					if (data) {
						this.setState(previousState => {
							previousState.data.moderation = data;
							return previousState;
						});
					}
				} else if (resp.statusCode === 409) {
					toastr.warning('Не все материалы заполнены');
				} else {
					toastr.error('Не удалось отправить магазин на модерацию');
				}
			});
		},

		handleImagesUploadUpload(data) {
			this.requestMerchantUploadLogo(data.id);
		},

		handleMerchantUpdate(data) {
			this.setState({data});
		},

		handleClickModeration() {
			this.requestModeration();
		},

		handleClickPromoSelect() {
			console.log('p');
		},

		handleClickPromoOptionsSelect() {
			console.log('o');
		},

		render() {
			const {
				data,
				id
			} = this.state;
			const {
				image,
				isPreviewable,
				moderation = {},
				optionsCount = 0,
				partners,
				paymentStatus,
				previewUrl,
				promo
			} = data;

			const moderationStatus = moderation.status;
			const moderationComment = moderation.comment;
			const promoName = promo ? promo.name : 'Не выбран';
			const activePromoId = promo ? promo.id : null;

			const isAdmin = hasRole('admin');
			const isAdvertiser = hasRole('advertiser');

			let isModerationAllowed = false;

			if (moderationStatus !== 1) {
				// TODO: Check is all merchant materials uploaded
				if (isAdmin || isAdvertiser) {
					isModerationAllowed = true;
				}
			}

			return (
				<div className="">
					<MerchantEditStatusPanel
						onClickModeration={this.handleClickModeration}
						onClickPromoSelect={this.handleClickPromoSelect}
						onClickPromoOptionsSelect={this.handleClickPromoOptionsSelect}
						{...{
							isModerationAllowed,
							isPreviewable,
							moderationComment,
							moderationStatus,
							optionsCount,
							paymentStatus,
							previewUrl,
							promoName
						}}
						/>

					<MerchantEditPromoSelect
						{...{
							activePromoId,
							id,
							paymentStatus
						}}
						/>

					<div className="merchant-edit-block">
						<h2>
							{'Информация'}
						</h2>

						<div className="panel panel-default">
							<div className="panel-body">
								<MerchantEditForm
									onSubmit={this.handleMerchantUpdate}
									{...{
										data,
										id
									}}
									/>

								<div className="form-group">
									<ControlLabel
										name="Логотип"
										/>

									<div className="">
										<p>
											{image ? (
												<img
													src={image.url}
													alt=""
													/>
											) : null}
										</p>

										<ImagesUpload
											onUpload={this.handleImagesUploadUpload}
											ext={['png', 'jpg']}
											width="210"
											height="130"
											exactSize
											/>
									</div>
								</div>
							</div>
						</div>
					</div>

					<MerchantPartnersSelect
						id={id}
						value={partners}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchant');
	ReactDOM.render(<AdminMerchant/>, block);
})();
