/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN, MERCHANT_DESCRIPTION_LENGTH} from '../const.js';
import {getFullUrl, hasRole} from '../utils.js';
import Form from '../components/form.jsx';
import ControlLabel from '../components/control-label.jsx';
import TextareaRich from '../components/textarea-rich.jsx';
import Checkbox from '../components/checkbox.jsx';

const className = 'merchant-edit-form';

class MerchantEditForm extends Form {
	constructor(props) {
		super(props);

		const {data} = props;
		const isAdmin = hasRole('admin');

		this.state = {
			isChanged: false,
			isLoading: false,
			fields: {
				name: {
					label: 'Название',
					value: data.name || ''
				},
				url: {
					label: 'URL',
					value: data.url || ''
				},
				slug: {
					addon: `${getFullUrl('merchants')}`,
					label: 'URL на сайте',
					value: data.slug || '',
					pattern: '^[a-z0-9-]+$',
					excluded: !isAdmin,
					readOnly: !isAdmin
				},
				description: {
					label: 'Описание',
					value: '',
					type: 'textarea',
					help: `Max. ${MERCHANT_DESCRIPTION_LENGTH} симв.`,
					maxlength: MERCHANT_DESCRIPTION_LENGTH
				},
				promocode: {
					label: 'Промо-код',
					value: '',
					help: 'Если Ваш магазин предоставляет скидку по промо-коду, укажите его в данном поле'
				},
				receivesNotifications: {
					text: 'Почтовые уведомления',
					type: 'checkbox',
					value: true,
					valueType: 'Boolean',
					excluded: !isAdmin,
					readOnly: !isAdmin
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
		this.handleChangeDescription = this.handleChangeDescription.bind(this);
		this.handleChangeReceivesNotifications = this.handleChangeReceivesNotifications.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const {data} = nextProps;

		this.setState(previousState => {
			const {fields} = previousState;

			_.forEach(fields, (field, name) => {
				let value = data[name] || '';
				if (field.valueType === 'Boolean') {
					value = data[name] || false;
				}
				field.value = value;
			});

			return previousState;
		});
	}

	requestMerchantUpdate() {
		if (!this.state.isChanged) {
			return;
		}

		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const {merchantId} = this.props;
		const json = this.serialize();

		xhr({
			url: `/api/merchants/${merchantId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({
				isChanged: false,
				isLoading: false
			});

			if (data) {
				switch (resp.statusCode) {
					case 200: {
						if (this.props.onSubmit) {
							this.props.onSubmit(data);
						}

						break;
					}
					case 400: {
						this.processErrors(data);
						break;
					}
					default: {
						toastr.error('Не удалось обновить информацию о магазине');
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось обновить информацию о магазине');
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestMerchantUpdate();
	}

	handleChangeDescription(e) {
		this.setState(previousState => {
			previousState.fields.description.value = e.target.value;
			previousState.isChanged = true;
			return previousState;
		}, () => {
			this.requestMerchantUpdate();
		});
	}

	handleChangeReceivesNotifications(value) {
		this.setState(previousState => {
			previousState.fields.receivesNotifications.value = value;
			previousState.isChanged = true;
			return previousState;
		}, () => {
			this.requestMerchantUpdate();
		});
	}

	render() {
		const {fields} = this.state;

		return (
			<div className={className}>
				<form
					action=""
					onBlur={this.handleClickSubmit}
					>
					{this.buildRow('name')}
					{this.buildRow('url')}
					{this.buildRow('slug')}

					<div className="form-group">
						<ControlLabel
							name={fields.description.label}
							required={fields.description.required}
							/>

						<TextareaRich
							value={fields.description.value}
							maxlength={fields.description.maxlength}
							onChange={this.handleChangeDescription}
							/>

						<span className="help-block">
							{fields.description.help}
						</span>
					</div>

					{this.buildRow('promocode')}

					<div className="form-group">
						<Checkbox
							text={fields.receivesNotifications.text}
							isChecked={fields.receivesNotifications.value}
							disabled={fields.receivesNotifications.readOnly}
							onChange={this.handleChangeReceivesNotifications}
							/>
					</div>
				</form>
			</div>
		);
	}
}
MerchantEditForm.propTypes = {
	data: React.PropTypes.object,
	merchantId: React.PropTypes.number.isRequired
};
MerchantEditForm.defaultProps = {
	data: {}
};

export default MerchantEditForm;
