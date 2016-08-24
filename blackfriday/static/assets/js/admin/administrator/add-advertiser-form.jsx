/* global toastr, FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import FormRow from '../components/form-row.jsx';

const PASSWORD_REGEXP = /^\S{8,}$/;
const EMAIL_REGEXP = /\S@\S+\.\S/;

const AddAdvertiserForm = React.createClass({
	propTypes: {
		onSubmit: React.PropTypes.func
	},

	getInitialState() {
		return {
			login: '',
			password: '',
			password2: ''
		};
	},

	requestAddAdvertiser() {
		const formData = new FormData(this.form);

		xhr({
			url: '/admin/user',
			method: 'POST',
			body: formData
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				toastr.success('Новый рекламодатель успешно добавлен');
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else {
				if (resp.statusCode === 400) {
					toastr.error(data);
				}
				toastr.error('Не удалось добавить нового рекламодателя');
			}
		});
	},

	handleChange(e) {
		this.updateData(e.target.name, e.target.value);
	},

	handleClickNext(e) {
		e.preventDefault();
		this.requestAddAdvertiser();
	},

	updateData(name, value) {
		this.setState({[name]: value});
	},

	isValid() {
		return this.checkEmail() && this.checkPassword();
	},

	checkEmail() {
		return EMAIL_REGEXP.test(this.state.login);
	},

	checkPassword() {
		const {password, password2} = this.state;
		return PASSWORD_REGEXP.test(password) && password === password2;
	},

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<form
				ref={form}
				action="/admin/user"
				method="POST"
				>
				<input
					name="role"
					value="advertiser"
					type="hidden"
					/>

				<FormRow
					label="Email"
					value={this.state.login}
					name="login"
					type="email"
					onChange={this.handleChange}
					required
					/>

				<FormRow
					label="Пароль"
					value={this.state.password}
					name="password"
					type="password"
					onChange={this.handleChange}
					required
					help="Не менее 8 симв., латинские буквы или цифры."
					/>

				<FormRow
					label="Повторите пароль"
					value={this.state.password2}
					name="password2"
					type="password"
					onChange={this.handleChange}
					required
					/>

				<div className="form-group">
					<button
						className="btn btn-primary"
						onClick={this.handleClickNext}
						type="submit"
						disabled={!this.isValid()}
						style={{marginRight: 10}}
						>
						Продолжить
					</button>
				</div>
			</form>
		);
	}
});

export default AddAdvertiserForm;
