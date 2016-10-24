/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {getFullUrl, hasRole} from '../utils.js';
import Form from '../components/form.jsx';
import ControlLabel from '../components/control-label.jsx';
import TextareaRich from '../components/textarea-rich.jsx';

const className = 'merchant-edit-form';
const DESCRIPTION_LENGTH = 1000;

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
					value: data.name || '',
					required: true
				},
				url: {
					label: 'URL',
					value: data.url || '',
					required: true
				},
				slug: {
					addon: `${getFullUrl('merchants')}`,
					label: 'URL на сайте',
					value: data.slug || '',
					pattern: '^[a-z0-9-]+$',
					required: true,
					excluded: !isAdmin,
					readOnly: !isAdmin
				},
				description: {
					label: 'Описание',
					value: '',
					type: 'textarea',
					required: true,
					help: `Max. ${DESCRIPTION_LENGTH} симв.`,
					maxlength: DESCRIPTION_LENGTH
				},
				promocode: {
					label: 'Промо-код',
					value: '',
					help: 'Если Ваш магазин предоставляет скидку по промо-коду, укажите его в данном поле'
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
		this.handleChangeDescription = this.handleChangeDescription.bind(this);
	}

	componentWillReceiveProps(nextProps) {
		const {data} = nextProps;

		this.setState(previousState => {
			const {fields} = previousState;

			_.forEach(fields, (field, name) => {
				field.value = data[name] || '';
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
