/* global toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class AddMerchantForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				url: {
					label: 'Ссылка',
					value: null,
					defaultValue: null,
					required: true
				},
				image: {
					label: 'Логотип',
					value: '',
					type: 'file',
					accept: 'image/*',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestAdd() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);

		xhr({
			url: '/api/landing-logos/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 201: {
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(JSON.parse(data));
					}

					break;
				}
				case 400: {
					this.processErrors(JSON.parse(data));
					break;
				}
				default: {
					toastr.error('Не удалось добавить логотип');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAdd();
	}

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<div className={b('add-merchant')}>
				<div className="modal-body">
					<form
						ref={form}
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('url')}
						{this.buildRow('image')}
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
