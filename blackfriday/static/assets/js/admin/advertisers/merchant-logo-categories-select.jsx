/* global toastr */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import MultiselectTwoSides from 'react-multiselect-two-sides';

class MerchantLogoCategoriesSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isDisabled: false,
			isLoading: false,
			categories: [],
			value: []
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.requestCategories();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.value) {
			this.setState({value: newProps.value});
			return;
		}

		this.requestMerchantCategories();
	}

	requestCategories() {
		this.setState({isLoading: true});

		xhr({
			url: '/api/categories/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({categories: data});
				}
			} else {
				this.setState({isDisabled: true});
				toastr.error('Не удалось получить список категорий');
			}
		});
	}

	requestMerchantCategories() {
		this.setState({isLoading: true});

		const {id} = this.props;

		xhr({
			url: `/api/merchants/${id}/logo-categories/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({value: data.map(item => (item.id))});
				}
			} else {
				this.setState({isDisabled: true});
				toastr.error('Не удалось получить список категорий размещения логотипа');
			}
		});
	}

	requestMerchantCategoriesUpdate(value) {
		this.setState({isLoading: true});

		const {id} = this.props;

		const json = value;

		xhr({
			url: `/api/merchants/${id}/logo-categories/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({value: data.map(item => (item.id))});
				}
			} else {
				toastr.error('Не удалось обновить список категорий размещения логотипа');
			}
		});
	}

	handleChange(value) {
		this.requestMerchantCategoriesUpdate(value);
	}

	render() {
		const {
			categories,
			isDisabled,
			isLoading,
			value
		} = this.state;

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
				labelKey="name"
				valueKey="id"
				showControls
				searchable
				/>
		);
	}
}
MerchantLogoCategoriesSelect.propTypes = {
	id: React.PropTypes.number,
	value: React.PropTypes.array
};
MerchantLogoCategoriesSelect.defaultProps = {
};

export default MerchantLogoCategoriesSelect;
