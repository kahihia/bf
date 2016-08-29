/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {processErrors} from '../utils.js';
import {USER_ROLE, REGEXP, HELP_TEXT, TOKEN} from '../const.js';
import FormHorizontalRow from '../components/form-horizontal-row.jsx';

const DEFAULT_ROLE = 'advertiser';

const AddUser = React.createClass({
	propTypes: {
		onAddUser: React.PropTypes.func
	},

	getInitialState() {
		return {
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
	},

	requestAddUser() {
		if (!this.validate()) {
			return;
		}

		const fields = this.state.fields;
		const json = _.reduce(fields, (a, b, key) => {
			a[key] = b.value;
			return a;
		}, {});

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
						toastr.success('Пользователь успешно добавлен');
						this.resetForm();

						if (this.props.onAddUser) {
							this.props.onAddUser(data);
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

			toastr.error('Не удалось добавить пользователя');
		});
	},

	validate() {
		let isValid = true;

		_.forEach(this.state.fields, field => {
			if (field.required && !field.value) {
				isValid = false;
				toastr.warning(`Заполните поле "${field.label}"`);
				return false;
			}
		});

		if (isValid) {
			isValid = this.checkPassword();
			if (!isValid) {
				toastr.warning('Неверный формат пароля');
			}
		}

		return isValid;
	},

	checkPassword() {
		return REGEXP.password.test(this.state.fields.password.value);
	},

	handleChange(e) {
		const target = e.target;
		this.updateData(target.name, target.value);
	},

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAddUser();
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
			<FormHorizontalRow
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
			<div className={b('add-user')}>
				<h2>
					{'Добавить нового'}
				</h2>

				<form
					className="form-horizontal"
					action=""
					>
					{this.buildRow('email')}
					{this.buildRow('name')}
					{this.buildRow('password')}
					{this.buildRow('role')}

					<div className="form-group">
						<div className="col-sm-10 col-sm-offset-2">
							<button
								className="btn btn-primary"
								onClick={this.handleClickSubmit}
								type="submit"
								>
								{'Добавить'}
							</button>
						</div>
					</div>
				</form>
			</div>
		);
	}
});

export default AddUser;
