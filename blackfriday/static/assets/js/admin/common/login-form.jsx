/* global toastr _ FormData */

import React from 'react';
import xhr from 'xhr';
import {REGEXP, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class LoginForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
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
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось авторизоваться');
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось авторизоваться');
		});
	}

	validate() {
		return this.checkEmail() && this.checkPassword();
	}

	checkEmail() {
		return REGEXP.email.test(this.state.fields.username.value);
	}

	checkPassword() {
		return REGEXP.password.test(this.state.fields.password.value);
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
					{this.buildRow('username')}
					{this.buildRow('password')}

					<div className="form-group">
						<button
							className="btn btn-primary"
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
}
LoginForm.propTypes = {
};
LoginForm.defaultProps = {
};

export default LoginForm;
