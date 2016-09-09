/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';
import xhr from 'xhr';
import {processErrors} from '../utils.js';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import Form from '../components/form.jsx';
import Recaptcha from '../components/recaptcha.jsx';

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
					value: ''
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
					required: true,
					excluded: true
				},
				'g-recaptcha-response': {
					value: null,
					required: true
				}
			}
		};

		this.handleSubmit = this.handleSubmit.bind(this);
		this.handleRecaptchaVerify = this.handleRecaptchaVerify.bind(this);
		this.handleRecaptchaExpire = this.handleRecaptchaExpire.bind(this);
	}

	componentWillReceiveProps() {
		this.resetForm();
	}

	requestRegisterUser() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();
		json.role = 'advertiser';

		xhr({
			url: '/api/registration/',
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
						toastr.success('Вы успешно зарегистрированы');
						this.requestVerification(data.id);
						this.resetForm();

						if (this.props.onSubmit) {
							this.props.onSubmit(data);
						}
						break;
					}
					default: {
						processErrors(data);
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось зарегистрироваться');
		});
	}

	requestVerification(userId) {
		xhr({
			url: `/api/users/${userId}/verification/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			}
		}, err => {
			if (err) {
				toastr.error('Не удалось отправить письмо верификации');
			}
		});
	}

	validate(warnings) {
		let isValid = true;

		_.forEach(this.state.fields, field => {
			if (field.required && !field.value) {
				isValid = false;
				if (warnings) {
					toastr.warning(`Заполните поле "${field.label}"`);
				}
				return false;
			}
		});

		if (isValid) {
			isValid = this.checkEmail();
			if (warnings && !isValid) {
				toastr.warning('Неверный формат Email');
			}
		}

		if (isValid) {
			isValid = this.checkPassword();
			if (warnings && !isValid) {
				toastr.warning('Неверный формат пароля');
			}
		}

		if (isValid) {
			isValid = this.comparePasswords();
			if (warnings && !isValid) {
				toastr.warning('Пароли не совпадают');
			}
		}

		return isValid;
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

	handleRecaptchaVerify(response) {
		this.updateRecaptchaField(response);
	}

	handleRecaptchaExpire() {
		this.updateRecaptchaField();
	}

	updateRecaptchaField(response) {
		this.setState(previousState => {
			previousState.fields['g-recaptcha-response'].value = response || null;
			return previousState;
		});
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
						<Recaptcha
							elementId={'registration-recaptcha'}
							sitekey={TOKEN.recaptcha}
							onVerify={this.handleRecaptchaVerify}
							onExpire={this.handleRecaptchaExpire}
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
