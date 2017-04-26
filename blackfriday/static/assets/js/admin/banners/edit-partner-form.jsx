/* global _ toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class EditPartnerForm extends Form {
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
				url: {
					label: 'Ссылка',
					value: '',
					required: true
				},
				image: {
					label: 'Логотип',
					value: '',
					type: 'file',
					accept: 'image/*'
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentDidMount() {
		this.requestPartner();
	}

	componentWillReceiveProps() {
		this.resetForm();
		this.requestPartner();
	}

	requestPartner() {
		this.setState({isLoading: true});

		xhr({
			url: `/api/partners/${this.props.partnerId}/`,
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					_.forEach(state.fields, (field, name) => {
						if (name === 'image') {
							return;
						}

						if (data[name]) {
							field.value = data[name];
						}
					});
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить данные партнёра');
			}
		});
	}

	requestEdit() {
		if (!this.validate()) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData(this.form);
		if (!this.state.fields.image.value) {
			body.delete('image');
		}

		xhr({
			url: `/api/partners/${this.props.partnerId}/`,
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
				toastr.error('Не удалось отредактировать партнёра');
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
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
}
EditPartnerForm.propTypes = {
	partnerId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired,
	onSubmit: React.PropTypes.func
};
EditPartnerForm.defaultProps = {
};

export default EditPartnerForm;
