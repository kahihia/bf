/* global toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class AddSpecialForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				name: {
					label: 'Название',
					value: '',
					required: true
				},
				description: {
					label: 'Описание',
					value: '',
					type: 'textarea',
					required: true
				},
				document: {
					label: 'Документ (PDF)',
					value: '',
					type: 'file',
					accept: 'application/pdf',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestAddSpecial() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);

		xhr({
			url: '/api/specials/',
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
					toastr.error('Не удалось добавить предложение партнёра.');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAddSpecial();
	}

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<div className="add-special">
				<div className="modal-body">
					<form
						ref={form}
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('name')}
						{this.buildRow('description')}
						{this.buildRow('document')}
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
AddSpecialForm.propTypes = {
};
AddSpecialForm.defaultProps = {
};

export default AddSpecialForm;
