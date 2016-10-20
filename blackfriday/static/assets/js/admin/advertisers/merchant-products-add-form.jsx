/* global toastr FormData */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import Form from '../components/form.jsx';
import IsLoadingProgressBar from '../components/is-loading-progress-bar.jsx';

class MerchantProductsAddForm extends Form {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
				file: {
					label: 'Файл',
					value: null,
					type: 'file',
					accept: '.csv, .xml, .xlsx',
					help: '.csv, .xml, .xlsx',
					required: true
				}
			}
		};

		this.handleClickSubmit = this.handleClickSubmit.bind(this);
	}

	requestMerchantProductsAdd() {
		if (!this.validate(true)) {
			return;
		}

		this.setState({isLoading: true});

		const {merchantId} = this.props;
		const body = new FormData(this.form);

		xhr({
			url: `/api/merchants/${merchantId}/products/parse/`,
			method: 'POST',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			body
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					this.resetForm();

					if (this.props.onSubmit) {
						this.props.onSubmit(JSON.parse(data));
					}

					break;
				}
				case 400: {
					this.processErrors(JSON.parse(data));
					break;
				}
				default: {
					toastr.error('Не удалось загрузить товары');
					break;
				}
			}
		});
	}

	handleClickSubmit(e) {
		e.preventDefault();
		this.requestMerchantProductsAdd();
	}

	render() {
		const {
			isLoading
		} = this.state;
		const disabled = isLoading || !this.validate();

		const form = ref => {
			this.form = ref;
		};

		return (
			<div>
				<div className="modal-body">
					<form
						ref={form}
						action=""
						onSubmit={this.handleClickSubmit}
						>
						{this.buildRow('file')}
					</form>

					{isLoading ? <IsLoadingProgressBar/> : null}
				</div>

				<div className="modal-footer">
					<button
						className="btn btn-default"
						data-dismiss="modal"
						disabled={disabled}
						type="button"
						>
						{'Отмена'}
					</button>

					<button
						className="btn btn-primary"
						onClick={this.handleClickSubmit}
						disabled={disabled}
						type="button"
						>
						{'Загрузить'}
					</button>
				</div>
			</div>
		);
	}
}
MerchantProductsAddForm.propTypes = {
	merchantId: React.PropTypes.number.isRequired
};
MerchantProductsAddForm.defaultProps = {
};

export default MerchantProductsAddForm;
