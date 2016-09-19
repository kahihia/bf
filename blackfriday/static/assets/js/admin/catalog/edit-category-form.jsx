/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {getFullUrl} from '../utils.js';
import Form from '../components/form.jsx';

class EditCategoryForm extends Form {
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
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	componentDidMount() {
		this.requestCategory();
	}

	componentWillReceiveProps() {
		this.resetForm();
		this.requestCategory();
	}

	requestCategory() {
		this.setState({isLoading: true});

		xhr({
			url: `/api/categories/${this.props.categoryId}/`,
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				const state = this.state;

				if (data) {
					_.forEach(state.fields, (field, name) => {
						if (data[name]) {
							field.value = data[name];
						}
					});
				}

				this.forceUpdate();
			} else {
				toastr.error('Не удалось получить данные категории');
			}
		});
	}

	requestEdit() {
		if (!this.validate()) {
			return;
		}

		this.setState({isLoading: true});

		const json = this.serialize();

		xhr({
			url: `/api/categories/${this.props.categoryId}/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					if (this.props.onSubmit) {
						this.props.onSubmit(data);
					}
				}
			} else if (resp.statusCode === 400) {
				this.processErrors(data);
			} else {
				toastr.error('Не удалось изменить категорию');
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestEdit();
	}

	render() {
		return (
			<div>
				<div className="modal-body">
					<form action="">
						{this.buildRow('name')}
						{this.buildRow('slug')}
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
						{'Сохранить'}
					</button>
				</div>
			</div>
		);
	}
}
EditCategoryForm.propTypes = {
	categoryId: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]).isRequired,
	onSubmit: React.PropTypes.func
};
EditCategoryForm.defaultProps = {
};

export default EditCategoryForm;
