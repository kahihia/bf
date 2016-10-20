/* global toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

class ChangePasswordForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				password: {
					label: 'Введите новый пароль',
					value: '',
					help: HELP_TEXT.password,
					type: 'password',
					required: true
				},
				passwordConfirm: {
					label: 'Введите подтверждение пароля',
					value: '',
					type: 'password',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentWillReceiveProps() {
		this.resetForm();
	}

	requestChangePassword() {
		if (!this.validate()) {
			return;
		}

		this.setState({isLoading: true});

		const json = {
			password: this.state.fields.password.value
		};

		xhr({
			url: `/api/users/${this.props.userId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					toastr.success('Пароль успешно изменен');

					if (this.props.onSubmit) {
						this.props.onSubmit();
					}
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось изменить пароль');
			}
		});
	}

	validate() {
		return this.checkPassword() && this.comparePasswords();
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
		this.requestChangePassword();
	}

	render() {
		return (
			<div>
				<div className="modal-body">
					<form
						action=""
						onSubmit={this.handleClickSubmit}
						>
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
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
}
ChangePasswordForm.propTypes = {
	userId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired
};
ChangePasswordForm.defaultProps = {
};

export default ChangePasswordForm;
