/* global document toastr _ jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import AddUserForm from './admin/users/add-user-form.jsx';
import UsersList from './admin/users/users-list.jsx';

(function () {
	'use strict';

	const AdminUsers = React.createClass({
		getInitialState() {
			return {
				users: []
			};
		},

		componentWillMount() {
			this.requestUsers();
		},

		requestUsers() {
			xhr({
				url: '/api/users/',
				method: 'GET',
				json: true
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						this.setState({users: _.sortBy(data, 'id')});
					}
				} else {
					toastr.error('Не удалось получить список пользователей');
				}
			});
		},

		requestVerification(userId) {
			xhr({
				url: `/api/users/${userId}/verification/`,
				method: 'POST',
				headers: {
					'X-CSRFToken': TOKEN.csrftoken
				}
			}, (err, resp, data) => {
				if (!err && resp.statusCode === 200) {
					if (data) {
						const user = this.getUserById(userId);
						_.merge(user, data);
						this.forceUpdate();
						toastr.success('Письмо верификации успешно отправлено');
					}
				} else {
					toastr.error('Не удалось отправить письмо верификации');
				}
			});
		},

		handleVerificationClick(userId) {
			this.requestVerification(userId);
		},

		handleAddUserClick() {
			jQuery('#addUserModal').modal('show');
			const onSubmit = user => {
				this.handleAddUser(user);
				jQuery('#addUserModal').modal('hide');
			};
			ReactDOM.render(
				<AddUserForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('addUserForm')
			);
		},

		handleAddUser(user) {
			if (!user) {
				return;
			}

			const users = this.state.users;
			users.push(user);
			this.forceUpdate();

			// Send verification request for newbie user
			this.requestVerification(user.id);
		},

		getUserById(userId) {
			return _.find(this.state.users, {id: userId});
		},

		render() {
			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleAddUserClick}
						type="button"
						>
						{'Добавить'}
					</button>

					<hr/>

					<UsersList
						users={this.state.users}
						onVerificationClick={this.handleVerificationClick}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-users');
	ReactDOM.render(<AdminUsers/>, block);
})();
