import React from 'react';

import Glyphicon from '../components/glyphicon.jsx';
import RegistrationForm from '../common/registration-form.jsx';
import MerchantProfileForm from '../common/merchant-profile-form.jsx';

const UserRegistration = React.createClass({
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
		this.setState({step: 3});
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

				{step === 3 ? (
					<RegistrationSuccess/>
				) : null}
			</div>
		);
	}
});

export default UserRegistration;

const RegistrationHeader = props => (
	<div className="page-header">
		<h1>
			<strong>
				{'Регистрация'}
			</strong>

			<small>
				{props.step < 3 ? (
					<span>
						{`Шаг ${props.step} `}
						<span className="text-muted">
							{'/ 2'}
						</span>
					</span>
				) : (
					<Glyphicon
						name="ok"
						className="text-success"
						/>
				)}
			</small>
		</h1>
	</div>
);
RegistrationHeader.propTypes = {
	step: React.PropTypes.number.isRequired
};

const RegistrationSuccess = () => (
	<div>
		<p>
			{'На ваш Email отправлено письмо со ссылкой о подтверждении регистрации.'}
		</p>

		<p>
			<strong>
				{'Чтобы войти в личный кабинет, пожалуйста, подтвердите регистрацию.'}
			</strong>
		</p>

		<a
			className="btn btn-primary"
			href="/admin/login/"
			>
			{'Продолжить'}
		</a>
	</div>
);
