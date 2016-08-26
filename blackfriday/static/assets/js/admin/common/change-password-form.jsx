/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import FormRow from '../components/form-row.jsx';

const PASSWORD_REGEXP = /^\S{8,}$/;

const ChangePasswordForm = React.createClass({
	propTypes: {
		userId: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]).isRequired,
		onSubmit: React.PropTypes.func
	},

	getInitialState() {
		return {
			fields: {
				password: {
					label: 'Введите новый пароль',
					value: '',
					help: 'Не менее 8 симв., латинские буквы или цифры.',
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
	},

	componentWillReceiveProps() {
		this.resetForm();
	},

	resetForm() {
		const fields = this.state.fields;
		_.forEach(fields, field => {
			field.value = '';
		});
		this.forceUpdate();
	},

	requestChangePassword() {
		if (!this.validate()) {
			return;
		}

		xhr({
			url: `/api/users/${this.props.userId}/`,
			method: 'PATCH',
			json: {
				password: this.state.fields.password.value
			}
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data) {
					toastr.success('Пароль успешно изменен');

					if (this.props.onSubmit) {
						this.props.onSubmit();
					}
				}
			} else if (resp.statusCode === 400) {
				toastr.warning('Неверный формат пароля');
			} else {
				toastr.error('Не удалось изменить пароль');
			}
		});
	},

	validate() {
		return this.checkPassword() && this.comparePasswords();
	},

	checkPassword() {
		return PASSWORD_REGEXP.test(this.state.fields.password.value);
	},

	comparePasswords() {
		const {password, passwordConfirm} = this.state.fields;

		return password.value === passwordConfirm.value;
	},

	handleChange(e) {
		const target = e.target;
		this.updateData(target.name, target.value);
	},

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestChangePassword();
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
				<div className="modal-body">
					<form action="">
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
						disabled={!this.validate()}
						type="button"
						>
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
});

export default ChangePasswordForm;
