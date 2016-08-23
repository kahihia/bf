/* global React, toastr, FormData, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import xhr from 'xhr';

import FormRow from '../components/form-row.jsx';
import FormCol from '../components/form-col.jsx';

const PHONE_MASK = '+7 (111) 111-11-11';

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
			profileId: '',
			fields: {
				account: {
					label: 'Расчётный счёт',
					value: ''
				},
				addr: {
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
				contact: {
					label: 'ФИО ответственного лица',
					value: '',
					required: true
				},
				inn: {
					label: 'ИНН',
					value: '',
					required: true
				},
				jur_addr: {
					label: 'Юридический адрес',
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
				name: {
					label: 'Наименование юридического лица',
					value: '',
					required: true
				},
				phone: {
					label: 'Сотовый тел. отв. лица',
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

	requestProfileUser() {
		xhr({
			url: `/profile/user/${this.props.userId}`,
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					if (data.name) {
						state.fields.name.value = data.name;
					}

					if (data.id) {
						state.profileId = data.id;
					}

					if (data.adprofile) {
						Object.keys(state.fields).forEach(key => {
							state.fields[key].value = data.adprofile[key] || '';
						});
					}
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить реквизиты рекламодателя');
			}
		});
	},

	requestProfileUserSave() {
		if (!this.validate()) {
			return;
		}

		const data = this.state.fields;
		const requestData = {
			name: data.name.value,
			adprofile: Object.keys(data).reduce((a, b) => {
				if (b !== 'name') {
					a[b] = data[b].value || '';
				}
				return a;
			}, {})
		};

		xhr({
			url: `/profile/${this.state.profileId}`,
			method: 'PUT',
			json: requestData
		}, (err, resp) => {
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

	requestProfileUserCreate() {
		if (!this.validate()) {
			return;
		}

		const formData = new FormData(this.form);

		xhr({
			url: '/admin/profile',
			method: 'POST',
			body: formData
		}, (err, resp) => {
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

	validate() {
		let isValid = true;

		_.forEach(this.state.fields, field => {
			if (field.required && !field.value) {
				isValid = false;
				toastr.warning(`Заполните поле "${field.label}"`);
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
		const {label, required} = this.state.fields[name];
		let mask;

		if (name === 'phone') {
			mask = PHONE_MASK;
		}

		return (
			<FormRow
				value={this.state.fields[name].value}
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name, label, required, mask}}
				/>
		);
	},

	buildCol(name) {
		const {label, required} = this.state.fields[name];

		return (
			<FormCol
				className="col-xs-6"
				value={this.state.fields[name].value}
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name, label, required}}
				/>
		);
	},

	render() {
		const form = ref => {
			this.form = ref;
		};

		return (
			<form
				ref={form}
				action={`/profile/${this.state.profileId}`}
				method="POST"
				>
				<input
					name="user_id"
					value={this.props.userId}
					type="hidden"
					/>

				{this.buildRow('name')}

				<div className="form-group">
					<div className="row">
						{this.buildCol('inn')}
						{this.buildCol('kpp')}
					</div>
				</div>

				{this.buildRow('jur_addr')}
				{this.buildRow('addr')}
				{this.buildRow('account')}
				{this.buildRow('bank')}
				{this.buildRow('korr')}

				<div className="form-group">
					<div className="row">
						{this.buildCol('bik')}
						{this.buildCol('contact')}
					</div>
				</div>

				{this.buildRow('phone')}

				{this.props.readOnly ? null : (
					<div className="form-group">
						<button
							className="btn btn-primary"
							onClick={this.handleClickSubmit}
							type="submit"
							>
							Сохранить
						</button>
					</div>
				)}
			</form>
		);
	}
});

export default MerchantProfileForm;
