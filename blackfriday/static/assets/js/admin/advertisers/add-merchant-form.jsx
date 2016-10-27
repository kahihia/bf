/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN, SILVER_PROMO_ID} from '../const.js';
import {hasRole, processErrors} from '../utils.js';
import Form from '../components/form.jsx';

function callOnSubmit(merchantId) {
	if (this.props.onSubmit) {
		this.requestMerchant(merchantId, merchant => {
			this.props.onSubmit(merchant);
		});
	}
}

class AddMerchantForm extends Form {
	constructor(props) {
		super(props);

		const fields = {
			name: {
				label: 'Название',
				value: '',
				required: true
			},
			url: {
				label: 'Ссылка',
				value: null,
				required: true
			}
		};

		if (!hasRole('advertiser')) {
			fields.advertiserId = {
				label: 'Рекламодатель',
				value: '',
				valueType: 'Number',
				options: [],
				type: 'select',
				required: true
			};
		}

		this.state = {
			isLoading: false,
			advertisers: [],
			fields
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentDidMount() {
		if (!hasRole('advertiser')) {
			this.requestAdvertisers();
		}
	}

	requestAdvertisers() {
		this.setState({isLoading: true});

		xhr({
			url: '/api/advertisers/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const advertisers = _.sortBy(data, 'id');
				const advertiserOptions = _.map(advertisers, a => {
					return {
						id: a.id,
						name: `${a.name} (${a.email})`
					};
				});

				this.setState(previousState => {
					previousState.fields.advertiserId.options = advertiserOptions;
					previousState.advertisers = advertisers;
					return previousState;
				});
			}
		});
	}

	requestGiveSilverPromo(merchantId, callback) {
		const json = {
			merchantId: merchantId,
			promoId: SILVER_PROMO_ID
		};

		xhr({
			url: '/api/invoices/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 201: {
					xhr({
						url: `/api/invoices/${data.id}/`,
						method: 'PATCH',
						headers: {
							'X-CSRFToken': TOKEN.csrftoken
						},
						json: {status: 1} /* оплачен */
					}, (err, resp, data) => {
						switch (resp.statusCode) {
							case 200: {
								toastr.success('Магазину предоставлен рекламный пакет "Silver"');
								callback(merchantId);
								break;
							}
							case 400: {
								processErrors(data);
								break;
							}
							default: {
								toastr.error('Не удалось выставить счёт');
								break;
							}
						}
					});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось выставить счёт');
					break;
				}
			}
		});
	}

	advertiserIsSupernova(advertiserId) {
		const advertiser = _.find(this.state.advertisers, {id: advertiserId});

		return advertiser && advertiser.profile.isSupernova;
	}

	requestMerchant(merchantId, callback) {
		xhr({
			url: `/api/merchants/${merchantId}/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			switch (resp.statusCode) {
				case 200: {
					callback(data);
					break;
				}
				default: {
					toastr.error('Не удалось получить магазин');
					break;
				}
			}
		});
	}

	requestAdd() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();

		xhr({
			url: '/api/merchants/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (data) {
				switch (resp.statusCode) {
					case 201: {
						const merchantId = data.id;

						if (hasRole('admin') && this.advertiserIsSupernova(json.advertiserId)) {
							this.requestGiveSilverPromo(merchantId, callOnSubmit.bind(this));
						} else {
							callOnSubmit.bind(this)(merchantId);
						}

						this.resetForm();

						break;
					}
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось добавить магазин');
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось добавить магазин');
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAdd();
	}

	render() {
		return (
			<div className="add-merchant">
				<div className="modal-body">
					<form
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('name')}

						{hasRole('advertiser') ? null : (
							this.buildRow('advertiserId')
						)}

						{this.buildRow('url')}
					</form>
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={this.state.isLoading || !this.validate()}
						type="button"
						>
						{'Добавить'}
					</button>
				</div>
			</div>
		);
	}
}
AddMerchantForm.propTypes = {
};
AddMerchantForm.defaultProps = {
};

export default AddMerchantForm;
