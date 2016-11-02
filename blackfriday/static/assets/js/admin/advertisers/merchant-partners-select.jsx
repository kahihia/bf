/* global toastr */

import React from 'react';
import xhr from 'xhr';
import {TOKEN} from '../const.js';
import MultiselectTwoSides from 'react-multiselect-two-sides';

class MerchantPartnersSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isDisabled: false,
			isLoading: false,
			partners: [],
			value: []
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentWillMount() {
		this.requestPartners();
	}

	componentWillReceiveProps(newProps) {
		if (newProps.value) {
			this.setState({value: newProps.value});
			return;
		}

		this.requestMerchantPartners();
	}

	requestPartners() {
		this.setState({isLoading: true});

		xhr({
			url: '/api/partners/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({partners: data});
				}
			} else {
				this.setState({isDisabled: true});
				toastr.error('Не удалось получить список партнёров');
			}
		});
	}

	requestMerchantPartners() {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		xhr({
			url: `/api/merchants/${merchantId}/partners/`,
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({value: data.map(item => item.id)});
				}
			} else {
				this.setState({isDisabled: true});
				toastr.error('Не удалось получить список партнёров');
			}
		});
	}

	requestMerchantPartnersUpdate(value) {
		this.setState({isLoading: true});

		const {merchantId} = this.props;

		const json = value;

		xhr({
			url: `/api/merchants/${merchantId}/partners/`,
			method: 'PATCH',
			headers: {
				'X-CSRFToken': TOKEN.csrftoken
			},
			json
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				if (data) {
					this.setState({value: data.map(item => item.id)});
				}
			} else {
				toastr.error('Не удалось обновить список партнёров');
			}
		});
	}

	handleChange(value) {
		this.requestMerchantPartnersUpdate(value);
	}

	render() {
		const {
			partners,
			isDisabled,
			isLoading,
			value
		} = this.state;

		return (
			<div className="shop-edit-block">
				<h2>
					{'Партнёры'}
				</h2>

				<div className="panel panel-default">
					<div className="panel-body">
						<div className="row">
							<div className="col-xs-12">
								<MultiselectTwoSides
									disabled={isDisabled || isLoading}
									onChange={this.handleChange}
									clearFilterText="Очистить"
									availableHeader="Доступные"
									selectedHeader="Выбранные"
									selectAllText="Выбрать все"
									deselectAllText="Очистить"
									options={partners}
									value={value}
									labelKey="name"
									valueKey="id"
									showControls
									searchable
									/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
MerchantPartnersSelect.propTypes = {
	merchantId: React.PropTypes.number,
	value: React.PropTypes.array
};
MerchantPartnersSelect.defaultProps = {
};

export default MerchantPartnersSelect;
