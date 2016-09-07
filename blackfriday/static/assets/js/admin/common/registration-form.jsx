/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {processErrors} from '../utils.js';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class RegistrationForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
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

		this.handleSubmit = this.handleSubmit.bind(this);
	}

	componentWillReceiveProps() {
		this.resetForm();
	}

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
	}

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
	}

	validate() {
		return this.checkEmail() && this.checkPassword() && this.comparePasswords();
	}

	checkEmail() {
		return REGEXP.email.test(this.state.fields.email.value);
	}

	checkPassword() {
		return REGEXP.password.test(this.state.fields.password.value);
	}

	comparePasswords() {
		const {password, passwordConfirm} = this.state.fields;

		return password.value === passwordConfirm.value;
	}

	handleSubmit(e) {
		e.preventDefault();
		this.requestRegisterUser();
	}

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
}
RegistrationForm.propTypes = {
};
RegistrationForm.defaultProps = {
};

export default RegistrationForm;
