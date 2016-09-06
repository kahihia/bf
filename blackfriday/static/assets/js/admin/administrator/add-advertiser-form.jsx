/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {processErrors} from '../utils.js';
import {REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import FormRow from '../components/form-row.jsx';

const AddAdvertiserForm = React.createClass({
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
			this.setState({isLoading: false});

			if (data) {
				switch (resp.statusCode) {
					case 201: {
						toastr.success('Рекламодатель успешно добавлен');
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

			toastr.error('Не удалось добавить рекламодателя');
		});
	},

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

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAddAdvertiser();
	},

	resetForm() {
		const fields = this.state.fields;
		_.forEach(fields, field => {
			field.value = field.defaultValue || '';
		});
		this.forceUpdate();
	},

	buildRow(name) {
		const field = this.state.fields[name];

		return (
			<FormRow
				onChange={this.handleChange}
				{...{name}}
				{...field}
				/>
		);
	},

	updateData(name, value) {
		const state = this.state;
		state.fields[name].value = value;
		this.forceUpdate();
	},

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
						type="submit"
						>
						{'Продолжить'}
					</button>
				</div>
			</div>
		);
	}
});

export default AddAdvertiserForm;
