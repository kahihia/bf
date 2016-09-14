/* global toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {USER_ROLE, REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

const DEFAULT_ROLE = 'advertiser';

class AddUser extends Form {
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
					label: 'Имя/Название',
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
				},
				role: {
					label: 'Роль',
					value: DEFAULT_ROLE,
					defaultValue: DEFAULT_ROLE,
					options: USER_ROLE,
					type: 'select',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestAddUser() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();

		xhr({
			url: '/api/users/',
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
						toastr.success('Пользователь успешно добавлен');
						this.requestVerification(data.id);
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
						toastr.error('Не удалось добавить пользователя');
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось добавить пользователя');
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
		let isValid = super.validate(warnings);

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
		this.requestAddUser();
	}

	render() {
		return (
			<div className={b('add-user')}>
				<div className="modal-body">
					<form action="">
						{this.buildRow('email')}
						{this.buildRow('name')}
						{this.buildRow('password')}
						{this.buildRow('passwordConfirm')}
						{this.buildRow('role')}
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
AddUser.propTypes = {
};
AddUser.defaultProps = {
};

export default AddUser;
