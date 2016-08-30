/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import RegistrationForm from './admin/common/registration-form.jsx';
import MerchantProfileForm from './admin/common/merchant-profile-form.jsx';

require('css/auth.styl');

(function () {
	'use strict';

	const RegistrationHeader = props => (
		<div className="page-header">
			<h1>
				<strong>
					{'Регистрация'}
				</strong>

				<small>
					{`Шаг ${props.step} `}
					<span className="text-muted">
						{'/ 2'}
					</span>
				</small>
			</h1>
		</div>
	);
	RegistrationHeader.propTypes = {
		step: React.PropTypes.number.isRequired
	};

	const Auth = React.createClass({
		getInitialState() {
			return {
				step: 1,
				userId: null
			};
		},

		handleSubmitRegistration(user) {
			this.setState({
				userId: user.id,
				step: 2
			});
		},

		handleSubmitMerchantProfile() {
			console.log('success');
		},

		render() {
			const {step, userId} = this.state;

			return (
				<div className="">
					<RegistrationHeader
						step={step}
						/>

					{step === 1 ? (
						<RegistrationForm
							onSubmit={this.handleSubmitRegistration}
							/>
					) : null}

					{step === 2 ? (
						<MerchantProfileForm
							userId={userId}
							onSubmit={this.handleSubmitMerchantProfile}
							isNew
							/>
					) : null}
				</div>
			);
		}
	});

	const auth = document.getElementById('auth');
	ReactDOM.render(<Auth/>, auth);
})();
