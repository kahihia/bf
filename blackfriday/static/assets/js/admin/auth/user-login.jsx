import React from 'react';

import LoginForm from './login-form.jsx';

const UserLogin = React.createClass({
	getInitialState() {
		return {};
	},

	render() {
		return (
			<div className="">
				<UserLoginHeader/>
				<LoginForm/>
			</div>
		);
	}
});

export default UserLogin;

const UserLoginHeader = () => (
	<div className="page-header">
		<h1>
			<strong>
				{'Вход'}
			</strong>
			{' в личный кабинет'}
		</h1>
	</div>
);
