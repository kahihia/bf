/* global toastr, _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import b from 'b_';
import {TOKEN} from '../const.js';
import {getFullUrl} from '../utils.js';
import Form from '../components/form.jsx';

class AddCategoryForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				name: {
					label: 'Название',
					value: '',
					required: true
				},
				slug: {
					addon: `${getFullUrl('categories')}`,
					label: 'Ссылка',
					value: '',
					required: true
				},
				merchant: {
					label: 'Магазин',
					value: null,
					defaultValue: null,
					options: [],
					type: 'select',
					required: false
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentWillMount() {
		this.requestMerchants();
	}

	requestMerchants() {
		xhr({
			url: '/api/merchants/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			if (!err && resp.statusCode === 200) {
				if (data) {
					const merchantOptions = _.map(
						_.union(
							[{id: null, name: '- Выберите магазин -'}],
							_.sortBy(data, 'id')
						),
						m => {
							return {id: m.id, name: m.name};
						}
					);

					let newState = _.clone(this.state);

					newState.fields.merchant.options = merchantOptions;

					this.setState(newState);
				}
			} else {
				toastr.error('Не удалось получить список магазинов');
			}
		});
	}

	requestAddCategory() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();

		xhr({
			url: '/api/categories/',
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (data) {
				switch (resp.statusCode) {
					case 201: {
						this.resetForm();

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
						toastr.error('Не удалось добавить категорию');
						break;
					}
				}

				return;
			}

			toastr.error('Не удалось добавить категорию');
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestAddCategory();
	}

	render() {
		return (
			<div className={b('add-category')}>
				<div className="modal-body">
					<form
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('name')}
						{this.buildRow('slug')}
						{this.buildRow('merchant')}
					</form>
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={this.state.isLoading || !this.validate()}
						type="button"
						>
						{'Добавить'}
					</button>
				</div>
			</div>
		);
	}
}
AddCategoryForm.propTypes = {
};
AddCategoryForm.defaultProps = {
};

export default AddCategoryForm;
