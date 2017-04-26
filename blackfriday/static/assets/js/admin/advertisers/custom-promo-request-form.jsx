/* global toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';

const className = 'custom-promo-request';

class CustomPromoRequestForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				name: {
					label: 'ФИО',
					value: '',
					required: true
				},
				phone: {
					label: 'Контактный телефон',
					value: '',
					required: true
				},
				message: {
					label: 'Сообщение',
					value: '',
					type: 'textarea',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestCustomPromoRequest() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();

		xhr({
			url: '/api/custom-promo-request/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
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
					toastr.error('Не удалось отправить письмо');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestCustomPromoRequest();
	}

	render() {
		return (
			<div className={className}>
				<div className="modal-body">
					<form
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('name')}
						{this.buildRow('phone')}
						{this.buildRow('message')}
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
						{'Отправить'}
					</button>
				</div>
			</div>
		);
	}
}
CustomPromoRequestForm.propTypes = {
};
CustomPromoRequestForm.defaultProps = {
};

export default CustomPromoRequestForm;
