/* global toastr _ FormData */

import React from 'react';
import xhr from 'xhr';
import FormRow from '../components/form-row.jsx';
import {processErrors} from '../utils.js';
import {REGEXP, TOKEN} from '../const.js';

const RegistrationForm = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func
	},

	getInitialState() {
		return {
			isLoading: false,
			fields: {
				username: {
					label: 'Логин',
					value: '',
					type: 'email',
					required: true
				},
				password: {
					label: 'Пароль',
					value: '',
					help: (<a href="/admin/registration/">{'Регистрация'}</a>),
					type: 'password',
					required: true
				}
			}
		};
	},

	componentWillReceiveProps() {
		this.resetForm();
	},

	resetForm() {
		const fields = this.state.fields;
		_.forEach(fields, field => {
			field.value = field.defaultValue || '';
		});
		this.forceUpdate();
	},

	requestRegisterUser() {
		if (!this.validate()) {
			return;
		}

		this.setState({isLoading: true});

		const body = new FormData();
		const fields = this.state.fields;
		_.forEach(fields, (field, name) => {
			body.append(name, field.value);
		});
		body.append('csrfmiddlewaretoken', TOKEN.csrftoken);

		xhr({
			url: '/django-admin/login/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (data) {
				switch (resp.statusCode) {
					case 201: {
						toastr.success('Вы успешно авторизованы');
						this.resetForm();

						if (this.props.onSubmit) {
							this.props.onSubmit();
						}
						break;
					}
					default: {
						this.setState({isLoading: false});
						processErrors(data);
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось авторизоваться');
		});
	},

	validate() {
		return this.checkEmail() && this.checkPassword();
	},

	checkEmail() {
		return REGEXP.email.test(this.state.fields.username.value);
	},

	checkPassword() {
		return REGEXP.password.test(this.state.fields.password.value);
	},

	handleChange(e) {
		const target = e.target;
		this.updateData(target.name, target.value);
	},

	handleSubmit(e) {
		e.preventDefault();
		this.requestRegisterUser();
	},

	updateData(name, value) {
		const fields = this.state.fields;
		fields[name].value = value;
		this.forceUpdate();
	},

	buildRow(name) {
		const field = this.state.fields[name];
		const {value, label, help, type, required} = field;

		return (
			<FormRow
				onChange={this.handleChange}
				{...{value, name, label, help, type, required}}
				/>
		);
	},

	render() {
		return (
			<div>
				<form
					action=""
					onSubmit={this.handleSubmit}
					>
					{this.buildRow('username')}
					{this.buildRow('password')}

					<div className="form-group">
						<button
							className="btn btn-primary btn-lg"
							disabled={this.state.isLoading || !this.validate()}
							type="submit"
							>
							{'Войти'}
						</button>
					</div>
				</form>
			</div>
		);
	}
});

export default RegistrationForm;
