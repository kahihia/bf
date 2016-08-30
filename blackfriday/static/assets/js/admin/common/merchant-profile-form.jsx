/* global toastr _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {HEAD_BASIS, TOKEN} from '../const.js';
import FormRow from '../components/form-row.jsx';
import FormCol from '../components/form-col.jsx';

const PHONE_MASK = '+7 (111) 111-11-11';
const DEFAULT_BASIS = '0';

const MerchantProfileForm = React.createClass({
	propTypes: {
		userId: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]).isRequired,
		readOnly: React.PropTypes.bool,
		onSubmit: React.PropTypes.func,
		isNew: React.PropTypes.bool
	},

	getInitialState() {
		return {
			isLoading: false,
			profileId: '',
			fields: {
				account: {
					label: 'Расчётный счёт',
					value: ''
				},
				address: {
					label: 'Фактический адрес',
					value: ''
				},
				bank: {
					label: 'Наименование банка',
					value: ''
				},
				bik: {
					label: 'БИК',
					value: ''
				},
				contactName: {
					label: 'ФИО ответственного лица',
					value: '',
					required: true
				},
				contactPhone: {
					label: 'Сотовый тел. отв. лица',
					value: '',
					required: true
				},
				headAppointment: {
					label: 'Должность руководителя',
					value: ''
				},
				headBasis: {
					label: 'На основании чего действует руководитель',
					value: DEFAULT_BASIS,
					defaultValue: DEFAULT_BASIS,
					options: HEAD_BASIS,
					type: 'select'
				},
				headName: {
					label: 'ФИО руководителя',
					value: ''
				},
				inn: {
					label: 'ИНН',
					value: '',
					required: true
				},
				korr: {
					label: 'Корр. счёт',
					value: ''
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
					required: true
				}
			}
		};
	},

	componentDidMount() {
		if (this.props.isNew) {
			return;
		}

		this.requestProfileUser();
	},

	componentWillReceiveProps() {
		if (this.props.isNew) {
			return;
		}

		this.requestProfileUser();
	},

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
							state.fields[key].value = data.profile[key] || '';
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
	},

	// Update profile info
	requestProfileUserSave() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const data = this.state.fields;
		const json = {
			name: data.name.value,
			profile: Object.keys(data).reduce((a, b) => {
				if (b !== 'name') {
					a[b] = data[b].value || '';
				}
				return a;
			}, {})
		};

		xhr({
			url: `/api/advertisers/${this.state.profileId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit();
				}
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	},

	// Create profile info
	requestProfileUserCreate() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const data = this.state.fields;
		const json = {
			name: data.name.value,
			profile: Object.keys(data).reduce((a, b) => {
				if (b !== 'name') {
					a[b] = data[b].value || '';
				}
				return a;
			}, {})
		};

		xhr({
			url: `/api/advertisers/${this.props.userId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				toastr.success('Реквизиты рекламодателя успешно обновлены');
				if (this.props.onSubmit) {
					this.props.onSubmit();
				}
			} else {
				toastr.error('Не удалось обновить реквизиты рекламодателя');
			}
		});
	},

	validate(warnings) {
		let isValid = true;

		_.forEach(this.state.fields, field => {
			if (field.required && !field.value) {
				isValid = false;
				if (warnings) {
					toastr.warning(`Заполните поле "${field.label}"`);
				}
				return false;
			}
		});

		return isValid;
	},

	handleChange(e) {
		this.updateData(e.target.name, e.target.value);
	},

	handleClickSubmit(e) {
		e.preventDefault();

		if (this.props.isNew || this.state.profileId === '') {
			this.requestProfileUserCreate();
		} else {
			this.requestProfileUserSave();
		}
	},

	updateData(name, value) {
		const state = this.state;
		state.fields[name].value = value;
		this.forceUpdate();
	},

	buildRow(name) {
		const field = this.state.fields[name];
		let mask;

		if (name === 'contactPhone') {
			mask = PHONE_MASK;
		}

		return (
			<FormRow
				value={this.state.fields[name].value}
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name, mask}}
				{...field}
				/>
		);
	},

	buildCol(name) {
		const field = this.state.fields[name];

		return (
			<FormCol
				className="col-xs-6"
				value={this.state.fields[name].value}
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name}}
				{...field}
				/>
		);
	},

	render() {
		const {profileId, isLoading} = this.state;
		const {userId, readOnly} = this.props;

		return (
			<form
				action={`/profile/${profileId}`}
				method="POST"
				>
				<input
					name="user_id"
					value={userId}
					type="hidden"
					/>

				{this.buildRow('name')}

				<div className="form-group">
					<div className="row">
						{this.buildCol('inn')}
						{this.buildCol('kpp')}
					</div>
				</div>

				{this.buildRow('legalAddress')}
				{this.buildRow('address')}
				{this.buildRow('account')}
				{this.buildRow('bank')}
				{this.buildRow('korr')}

				<div className="form-group">
					<div className="row">
						{this.buildCol('bik')}
						{this.buildCol('contactName')}
					</div>
				</div>

				{this.buildRow('contactPhone')}

				{this.buildRow('headName')}
				{this.buildRow('headAppointment')}
				{this.buildRow('headBasis')}

				{readOnly ? null : (
					<div className="form-group">
						<button
							className="btn btn-primary"
							onClick={this.handleClickSubmit}
							disabled={isLoading || !this.validate()}
							type="submit"
							>
							{'Сохранить'}
						</button>
					</div>
				)}
			</form>
		);
	}
});

export default MerchantProfileForm;
