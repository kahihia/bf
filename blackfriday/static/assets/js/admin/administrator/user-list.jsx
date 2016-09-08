/* global document jQuery _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import ReactDOM from 'react-dom';
import b from 'b_';
import {USER_ROLE} from '../const.js';
import Glyphicon from '../components/glyphicon.jsx';
import FormRow from '../components/form-row.jsx';
import ChangePasswordForm from '../common/change-password-form.jsx';

const UserList = React.createClass({
	getInitialState() {
		return {
			userFilter: ''
		};
	},

	propTypes: {
		users: React.PropTypes.array,
		onVerificationClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleVerificationClick(userId) {
		this.props.onVerificationClick(userId);
	},

	handleChangePasswordClick(userId) {
		jQuery('#changePasswordModal').modal('show');
		const onSubmit = () => {
			jQuery('#changePasswordModal').modal('hide');
		};
		ReactDOM.render(
			<ChangePasswordForm
				userId={userId}
				key={userId}
				onSubmit={onSubmit}
				/>
			,
			document.getElementById('changePasswordForm')
		);
	},

	handleFilterUser(e) {
		this.setState({userFilter: e.target.value});
	},

	render() {
		const {userFilter} = this.state;
		const {users} = this.props;

		let filteredUsers = users;
		function foo(a, b) {
			if (!a || !b) {
				return;
			}

			return a.toLowerCase().indexOf(b.toLowerCase()) > -1;
		}
		if (userFilter) {
			filteredUsers = _.filter(filteredUsers, user => {
				const {email, name} = user;
				if (!name && !email) {
					return false;
				}
				return foo(name, userFilter) || foo(email, userFilter);
			});
		}

		return (
			<div className={b('user-list')}>
				<div className="form">
					<FormRow
						label="Поиск пользователя"
						placeholder="Email, Имя или Название"
						value={userFilter}
						onChange={this.handleFilterUser}
						/>
				</div>

				<table className={'table table-hover ' + b('user-list', 'table')}>
					<thead>
						<tr>
							<th className={b('user-list', 'table-th', {name: 'id'})}/>

							<th className={b('user-list', 'table-th', {name: 'email'})}>
								{'Email'}
							</th>

							<th className={b('user-list', 'table-th', {name: 'name'})}>
								{'Имя/Название'}
							</th>

							<th className={b('user-list', 'table-th', {name: 'role'})}>
								{'Роль'}
							</th>

							<th className={b('user-list', 'table-th', {name: 'status'})}>
								{'Подтверждён'}
							</th>

							<th className={b('user-list', 'table-th', {name: 'change-password'})}/>

							<th className={b('user-list', 'table-th', {name: 'verification'})}/>
						</tr>
					</thead>

					<tbody>
						{filteredUsers.map(item => {
							return (
								<UserListItem
									key={item.id}
									onChangePasswordClick={this.handleChangePasswordClick}
									onVerificationClick={this.handleVerificationClick}
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
		onChangePasswordClick: React.PropTypes.func,
		onVerificationClick: React.PropTypes.func
	},

	getDefaultProps() {
		return {};
	},

	handleChangePasswordClick() {
		this.props.onChangePasswordClick(this.props.id);
	},

	handleVerificationClick() {
		this.props.onVerificationClick(this.props.id);
	},

	render() {
		const {id, name, email, role, isActive} = this.props;

		return (
			<tr className={b('user-list', 'table-tr', {role: role})}>
				<td className={b('user-list', 'table-td', {name: 'id'})}>
					{`#${id}`}
				</td>

				<td className={b('user-list', 'table-td', {name: 'email'})}>
					<a href={`mailto:${email}`}>
						{email}
					</a>
				</td>

				<td className={b('user-list', 'table-td', {name: 'name'})}>
					{name ? (
						name
					) : (
						<em className="text-muted">
							{`${role === 'advertiser' ? 'название' : 'имя'} не задано`}
						</em>
					)}
				</td>

				<td className={b('user-list', 'table-td', {name: 'role'})}>
					{USER_ROLE[role]}
				</td>

				<td className={b('user-list', 'table-td', {name: 'status'})}>
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

				<td className={b('user-list', 'table-td', {name: 'change-password'})}>
					<button
						className="btn btn-sm btn-default"
						onClick={this.handleChangePasswordClick}
						type="button"
						>
						{'Сменить пароль'}
					</button>
				</td>

				<td className={b('user-list', 'table-td', {name: 'verification'})}>
					{isActive ? null : (
						<button
							className="btn btn-sm btn-default"
							onClick={this.handleVerificationClick}
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
