/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {processErrors} from '../utils.js';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class AddAdvertiserForm extends Form {
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

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestAddAdvertiser() {
		if (!this.validate(true)) {
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
						toastr.success('Рекламодатель успешно добавлен');
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
			toastr.error('Не удалось добавить рекламодателя');
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

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAddAdvertiser();
	}

	render() {
		return (
			<div className={b('add-advertiser')}>
				<div className="modal-body">
					<form action="">
						{this.buildRow('email')}
						{this.buildRow('name')}
						{this.buildRow('password')}
						{this.buildRow('passwordConfirm')}
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
						{'Продолжить'}
					</button>
				</div>
			</div>
		);
	}
}
AddAdvertiserForm.propTypes = {
};
AddAdvertiserForm.defaultProps = {
};

export default AddAdvertiserForm;
