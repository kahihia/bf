/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {TOKEN} from '../const.js';
import {hasRole} from '../utils.js';
import Form from '../components/form.jsx';

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
				let advertisers = data.reduce((a, b) => {
					a.push({
						id: b.id,
						name: `${b.name} (${b.email})`
					});
					return a;
				}, []);
				advertisers = _.sortBy(advertisers, 'id');
				this.setState(previousState => {
					previousState.fields.advertiserId.options = advertisers;
					return previousState;
				});
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
						this.resetForm();

						if (this.props.onSubmit) {
							this.props.onSubmit(data);
						}

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
			<div className={b('add-merchant')}>
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
