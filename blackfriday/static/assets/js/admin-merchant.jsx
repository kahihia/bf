/* global document toastr */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint-disable no-alert */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import {ENV} from './admin/utils.js';
import ImagesUpload from './admin/common/images-upload.jsx';

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

		handleImagesUploadUpload(data) {
			this.requestMerchantUploadLogo(data.id);
		},

		render() {
			const {
				image
			} = this.state.data;

			return (
				<div className="">
					<div className="shop-edit-block">
						<h2>
							{'Информация'}
						</h2>

						<div className="panel panel-default form-horizontal">
							<div className="panel-body">
								<div className="form-group">
									<span className="col-xs-2 control-label">
										{'Логотип'}
									</span>

									<div className="col-xs-10">
										<div className="row">
											<div className="col-xs-3">
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
						</div>
					</div>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-merchant');
	ReactDOM.render(<AdminMerchant/>, block);
})();
