/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {getFullUrl, hasRole} from '../utils.js';
import Form from '../components/form.jsx';
import MerchantDescriptionEditor from './merchant-description-editor.jsx';

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
					help: 'Max. 1000 симв.'
				},
				promocode: {
					label: 'Промо-код',
					value: '',
					help: 'Если Ваш магазин предоставляет скидку по промо-коду, укажите его в данном поле'
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
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

	render() {
		return (
			<div className={className}>
				<form
					action=""
					onBlur={this.handleClickSubmit}
					>
					{this.buildRow('name')}
					{this.buildRow('url')}
					{this.buildRow('slug')}
					{this.buildRow('description')}
					{this.buildRow('promocode')}

					<MerchantDescriptionEditor/>
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
