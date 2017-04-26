/* global document jQuery _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import {USER_ROLE} from '../const.js';
import Glyphicon from '../components/glyphicon.jsx';
import FormRow from '../components/form-row.jsx';
import ChangePasswordForm from './change-password-form.jsx';

const UserList = React.createClass({
	getInitialState() {
		return {
			userFilter: ''
		};
	},

	propTypes: {
		users: React.PropTypes.array,
		onClickVerification: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickVerification(userId) {
		this.props.onClickVerification(userId);
	},

	handleClickPasswordChange(userId) {
		jQuery('#change-password-modal').modal('show');
		const onSubmit = () => {
			jQuery('#change-password-modal').modal('hide');
		};
		ReactDOM.render(
			<ChangePasswordForm
				userId={userId}
				key={userId}
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('change-password-form')
		);
	},

	handleFilterUser(e) {
		this.setState({userFilter: e.target.value});
	},

	render() {
		const {userFilter} = this.state;
		const {users} = this.props;

		let filteredUsers = users;

		if (userFilter) {
			filteredUsers = _.filter(filteredUsers, user => {
				const {email, name} = user;

				if (!name && !email) {
					return false;
				}

				return contains(userFilter, name) || contains(userFilter, email);
			});
		}

		const className = 'user-list';

		return (
			<div className={b(className)}>
				<div className="form">
					<FormRow
						label="Поиск пользователя"
						placeholder="Email, Имя или Название"
						value={userFilter}
						onChange={this.handleFilterUser}
						/>
				</div>

				<table className={'table table-hover ' + b(className, 'table')}>
					<thead>
						<tr>
							<th className={b(className, 'table-th', {name: 'id'})}/>

							<th className={b(className, 'table-th', {name: 'email'})}>
								{'Email'}
							</th>

							<th className={b(className, 'table-th', {name: 'name'})}>
								{'Имя/Название'}
							</th>

							<th className={b(className, 'table-th', {name: 'role'})}>
								{'Роль'}
							</th>

							<th className={b(className, 'table-th', {name: 'status'})}>
								{'Подтверждён'}
							</th>

							<th className={b(className, 'table-th', {name: 'change-password'})}/>
						</tr>
					</thead>

					<tbody>
						{filteredUsers.map(item => {
							return (
								<UserListItem
									key={item.id}
									onClickPasswordChange={this.handleClickPasswordChange}
									onClickVerification={this.handleClickVerification}
									{...item}
									/>
							);
						})}
					</tbody>
				</table>
			</div>
		);
	}
});

export default UserList;

const UserListItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		email: React.PropTypes.string,
		role: React.PropTypes.string,
		isActive: React.PropTypes.bool,
		onClickPasswordChange: React.PropTypes.func,
		onClickVerification: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleClickPasswordChange() {
		this.props.onClickPasswordChange(this.props.id);
	},

	handleClickVerification() {
		this.props.onClickVerification(this.props.id);
	},

	render() {
		const {id, name, email, role, isActive} = this.props;
		const className = 'user-list';

		return (
			<tr className={b(className, 'table-tr', {role: role})}>
				<td className={b(className, 'table-td', {name: 'id'})}>
					{`#${id}`}
				</td>

				<td className={b(className, 'table-td', {name: 'email'})}>
					<a href={`mailto:${email}`}>
						{email}
					</a>
				</td>

				<td className={b(className, 'table-td', {name: 'name'})}>
					{name ? (
						name
					) : (
						<em className="text-muted">
							{`${role === 'advertiser' ? 'название' : 'имя'} не задано`}
						</em>
					)}
				</td>

				<td className={b(className, 'table-td', {name: 'role'})}>
					{USER_ROLE[role]}
				</td>

				<td className={b(className, 'table-td', {name: 'status'})}>
					{isActive ? (
						<Glyphicon
							name="ok"
							className="text-success"
							/>
					) : (
						<Glyphicon
							name="remove"
							className="text-danger"
							/>
					)}
				</td>

				<td className={b(className, 'table-td', {name: 'change-password'})}>
					<button
						className="btn btn-sm btn-warning btn-block"
						onClick={this.handleClickPasswordChange}
						type="button"
						>
						{'Сменить пароль'}
					</button>

					{isActive ? null : (
						<button
							className="btn btn-sm btn-success btn-block"
							onClick={this.handleClickVerification}
							type="button"
							>
							{'Выслать проверочный код'}
						</button>
					)}
				</td>
			</tr>
		);
	}
});

function contains(what, where) {
	if (!what || !where) {
		return;
	}

	if (where.toLowerCase().indexOf(what.toLowerCase()) > -1) {
		return true;
	}
	return false;
}
