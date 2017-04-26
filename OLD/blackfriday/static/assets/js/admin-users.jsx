/* global document toastr _ jQuery */

import React from 'react';
import ReactDOM from 'react-dom';
import xhr from 'xhr';
import {TOKEN} from './admin/const.js';
import AddUserForm from './admin/users/add-user-form.jsx';
import UserList from './admin/users/user-list.jsx';

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

		handleClickVerification(userId) {
			this.requestVerification(userId);
		},

		handleClickUserAdd() {
			jQuery('#add-user-modal').modal('show');
			const onSubmit = user => {
				this.handleUserAdd(user);
				jQuery('#add-user-modal').modal('hide');
			};
			ReactDOM.render(
				<AddUserForm
					onSubmit={onSubmit}
					/>
				,
				document.getElementById('add-user-form')
			);
		},

		handleUserAdd(user) {
			if (!user) {
				return;
			}

			const users = this.state.users;
			users.push(user);
			this.forceUpdate();
		},

		getUserById(userId) {
			return _.find(this.state.users, {id: userId});
		},

		render() {
			return (
				<div>
					<button
						className="btn btn-success"
						onClick={this.handleClickUserAdd}
						type="button"
						>
						{'Добавить'}
					</button>

					<hr/>

					<UserList
						users={this.state.users}
						onClickVerification={this.handleClickVerification}
						/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-users');
	ReactDOM.render(<AdminUsers/>, block);
})();
