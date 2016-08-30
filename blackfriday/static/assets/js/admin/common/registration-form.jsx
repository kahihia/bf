/* global toastr _ */

import React from 'react';
import xhr from 'xhr';
import FormRow from '../components/form-row.jsx';
import {processErrors} from '../utils.js';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';

const RegistrationForm = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func
	},

	getInitialState() {
		return {
			isLoading: false,
			fields: {
				email: {
					label: 'Email',
					value: '',
					type: 'email',
					required: true
				},
				name: {
					label: 'Название',
					value: '',
					type: 'text',
					required: false
				},
				password: {
					label: 'Пароль',
					value: '',
					help: HELP_TEXT.password,
					type: 'password',
					required: true
				},
				passwordConfirm: {
					label: 'Повторите пароль',
					value: '',
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

		const fields = this.state.fields;
		const json = _.reduce(fields, (a, b, key) => {
			a[key] = b.value;
			return a;
		}, {role: 'advertiser'});

		xhr({
			url: '/api/users/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			if (data) {
				switch (resp.statusCode) {
					case 201: {
						toastr.success('Вы успешно зарегистрированы');
						this.requestVerification(data);
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

			this.setState({isLoading: false});
			toastr.error('Не удалось зарегистрироваться');
		});
	},

	requestVerification(userData) {
		xhr({
			url: `/api/users/${userData.id}/verification/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			}
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					toastr.success('Письмо верификации успешно отправлено');
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(userData);
					}
				}
			} else {
				toastr.error('Не удалось отправить письмо верификации');
			}
		});
	},

	validate() {
		return this.checkEmail() && this.checkPassword() && this.comparePasswords();
	},

	checkEmail() {
		return REGEXP.email.test(this.state.fields.email.value);
	},

	checkPassword() {
		return REGEXP.password.test(this.state.fields.password.value);
	},

	comparePasswords() {
		const {password, passwordConfirm} = this.state.fields;

		return password.value === passwordConfirm.value;
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
					{this.buildRow('email')}
					{this.buildRow('name')}
					{this.buildRow('password')}
					{this.buildRow('passwordConfirm')}

					<div className="form-group">
						<div
							className="g-recaptcha"
							data-sitekey={TOKEN.recaptcha}
							/>
					</div>

					<div className="form-group">
						<button
							className="btn btn-primary"
							disabled={this.state.isLoading || !this.validate()}
							type="submit"
							>
							{'Продолжить'}
						</button>
					</div>
				</form>
			</div>
		);
	}
});

export default RegistrationForm;
