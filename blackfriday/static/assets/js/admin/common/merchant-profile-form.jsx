/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {HEAD_BASIS, TOKEN} from '../const.js';
import Form from '../components/form.jsx';

const PHONE_MASK = '+7 (111) 111-11-11';
const DEFAULT_BASIS = 0;

class MerchantProfileForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			profileId: '',
			fields: {
				account: {
					label: 'Расчётный счёт',
					value: '',
					required: true
				},
				address: {
					label: 'Фактический адрес',
					value: '',
					required: true
				},
				bank: {
					label: 'Наименование банка',
					value: '',
					required: true
				},
				bik: {
					label: 'БИК',
					value: '',
					required: true
				},
				contactName: {
					label: 'ФИО ответственного лица',
					value: '',
					required: true
				},
				contactPhone: {
					label: 'Сотовый тел. отв. лица',
					value: '',
					required: true,
					mask: PHONE_MASK
				},
				headAppointment: {
					label: 'Должность руководителя',
					value: '',
					required: true
				},
				headBasis: {
					label: 'На основании чего действует руководитель',
					value: DEFAULT_BASIS,
					defaultValue: DEFAULT_BASIS,
					valueType: 'Number',
					options: HEAD_BASIS,
					type: 'select',
					required: true
				},
				headName: {
					label: 'ФИО руководителя',
					value: '',
					required: true
				},
				inn: {
					label: 'ИНН',
					value: '',
					required: true
				},
				korr: {
					label: 'Корр. счёт',
					value: '',
					required: true
				},
				kpp: {
					label: 'КПП',
					value: '',
					required: true
				},
				legalAddress: {
					label: 'Юридический адрес',
					value: '',
					required: true
				},
				name: {
					label: 'Наименование юридического лица',
					value: '',
					required: true,
					excluded: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentDidMount() {
		const props = this.props;

		if (props.userName) {
			this.setState(previousState => {
				previousState.fields.name.value = props.userName;
				return previousState;
			});
		}

		if (props.isNew) {
			return;
		}

		this.requestProfileUser();
	}

	componentWillReceiveProps(nextProps) {
		if (nextProps.userName) {
			this.setState(previousState => {
				previousState.fields.name.value = nextProps.userName;
				return previousState;
			});
		}

		if (nextProps.isNew) {
			return;
		}

		this.requestProfileUser();
	}

	// Get profile info
	requestProfileUser() {
		this.setState({isLoading: true});

		xhr({
			url: `/api/advertisers/${this.props.userId}/`,
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					if (data.id) {
						state.profileId = data.id;
					}

					if (data.profile) {
						Object.keys(state.fields).forEach(key => {
							const field = state.fields[key];
							let value = data.profile[key];
							if (_.isUndefined(value) || _.isNull(value)) {
								if (!_.isUndefined(field.defaultValue)) {
									value = field.defaultValue;
								}
							}
							field.value = value;
						});
					}

					if (data.name) {
						state.fields.name.value = data.name;
					}
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить реквизиты рекламодателя');
			}
		});
	}

	// Update profile info
	requestProfileUserSave() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const fields = this.state.fields;
		const json = {
			name: fields.name.value,
			profile: this.serialize()
		};

		xhr({
			url: `/api/advertisers/${this.state.profileId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	}

	// Create profile info
	requestProfileUserCreate() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const fields = this.state.fields;
		const json = {
			name: fields.name.value,
			profile: this.serialize()
		};

		xhr({
			url: `/api/advertisers/${this.props.userId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit(data);
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();

		if (this.props.isNew || this.state.profileId === '') {
			this.requestProfileUserCreate();
		} else {
			this.requestProfileUserSave();
		}
	}

	render() {
		const {profileId, isLoading} = this.state;
		const {userId, readOnly} = this.props;
		const isValid = this.validate();

		return (
			<form
				action={`/profile/${profileId}`}
				method="POST"
				onSubmit={this.handleClickSubmit}
				>
				<input
					name="user_id"
					value={userId}
					type="hidden"
					/>

				{this.buildRow('name')}

				<div className="form-group">
					<div className="row">
						{this.buildCol('bik')}
						{this.buildCol('inn')}
					</div>
				</div>

				<div className="form-group">
					<div className="row">
						{this.buildCol('kpp')}
						{this.buildCol('korr')}
					</div>
				</div>

				{this.buildRow('account')}
				{this.buildRow('bank')}

				{this.buildRow('address')}
				{this.buildRow('legalAddress')}
				{this.buildRow('contactName')}
				{this.buildRow('contactPhone')}

				{this.buildRow('headName')}
				{this.buildRow('headAppointment')}
				{this.buildRow('headBasis')}

				{readOnly ? null : (
					<div className="form-group">
						<button
							className="btn btn-primary"
							disabled={isLoading || !isValid}
							type="submit"
							>
							{'Сохранить'}
						</button>
					</div>
				)}
			</form>
		);
	}
}
MerchantProfileForm.propTypes = {
	userId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired,
	userName: React.PropTypes.string,
	isNew: React.PropTypes.bool
};
MerchantProfileForm.defaultProps = {
};

export default MerchantProfileForm;
