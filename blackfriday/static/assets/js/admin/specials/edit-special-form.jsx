/* global _ toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class EditSpecialForm extends Form {
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
					required: false
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentDidMount() {
		this.requestSpecial();
	}

	componentWillReceiveProps() {
		this.resetForm();
		this.requestSpecial();
	}

	requestSpecial() {
		this.setState({isLoading: true});

		xhr({
			url: `/api/specials/${this.props.specialId}/`,
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					_.forEach(state.fields, (field, name) => {
						if (name === 'document') {
							return;
						}

						if (data[name]) {
							field.value = data[name];
						}
					});
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить предложение партнёра.');
			}
		});
	}

	requestEdit() {
		if (!this.validate()) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);
		if (!this.state.fields.document.value) {
			body.delete('document');
		}

		xhr({
			url: `/api/specials/${this.props.specialId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					if (this.props.onSubmit) {
						this.props.onSubmit(JSON.parse(data));
					}
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(JSON.parse(data));
			} else {
				toastr.error('Не удалось отредактировать предложение партнёра.');
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestEdit();
	}

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<div>
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
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
}
EditSpecialForm.propTypes = {
	specialId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired,
	onSubmit: React.PropTypes.func
};
EditSpecialForm.defaultProps = {
};

export default EditSpecialForm;
