/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import {processErrors} from '../utils.js';
import MultiselectTwoSides from 'react-multiselect-two-sides';

class MerchantLogoCategoriesSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isDisabled: false,
			isLoading: false,
			value: []
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.requestMerchantLogoCategories();
	}

	requestMerchantLogoCategories() {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/logo-categories/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					const value = data.map(item => item.id);
					this.setState({value}, () => {
						this.props.onChange(value);
					});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					this.setState({isDisabled: true});
					toastr.error('Не удалось получить список категорий размещения логотипа');
					break;
				}
			}
		});
	}

	requestMerchantLogoCategoriesUpdate(value) {
		this.setState({isLoading: true});

		const {merchantId} = this.props;
		const json = value;

		xhr({
			url: `/api/merchants/${merchantId}/logo-categories/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			switch (resp.statusCode) {
				case 200: {
					const value = data.map(item => item.id);
					this.setState({value}, () => {
						this.props.onChange(value);
					});
					break;
				}
				case 400: {
					processErrors(data);
					break;
				}
				default: {
					toastr.error('Не удалось обновить список категорий размещения логотипа');
					break;
				}
			}
		});
	}

	handleChange(value) {
		this.requestMerchantLogoCategoriesUpdate(value);
	}

	render() {
		const {
			isDisabled,
			isLoading,
			value
		} = this.state;
		const {
			categories,
			categoriesHighlighted,
			limit
		} = this.props;

		return (
			<MultiselectTwoSides
				disabled={isDisabled || isLoading}
				onChange={this.handleChange}
				clearFilterText="Очистить"
				availableHeader="Доступные"
				selectedHeader="Выбранные"
				selectAllText="Выбрать все"
				deselectAllText="Очистить"
				options={categories}
				value={value}
				highlight={categoriesHighlighted}
				limit={limit}
				labelKey="name"
				valueKey="id"
				showControls
				searchable
				/>
		);
	}
}
MerchantLogoCategoriesSelect.propTypes = {
	categories: React.PropTypes.array,
	categoriesHighlighted: React.PropTypes.array,
	limit: React.PropTypes.number,
	merchantId: React.PropTypes.number,
	onChange: React.PropTypes.func
};
MerchantLogoCategoriesSelect.defaultProps = {
};

export default MerchantLogoCategoriesSelect;
