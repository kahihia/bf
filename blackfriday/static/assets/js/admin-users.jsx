/* global document toastr _ */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import Cookie from 'js-cookie';
import AddUser from './admin/administrator/add-user.jsx';
import UserList from './admin/administrator/user-list.jsx';

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
					'X-CSRFToken': Cookie.get('csrftoken')
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
					<AddUser
						onAddUser={this.handleAddUser}
						/>

					<hr/>

					<UserList
						users={this.state.users}
						onVerificationClick={this.handleVerificationClick}
						/>
				</div>
			);
		}
	});

	const adminUsers = document.getElementById('admin-users');
	ReactDOM.render(<AdminUsers/>, adminUsers);
})();
