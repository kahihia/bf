/* global _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Select from '../components/select.jsx';

class PromoSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			promos: [],
			isLoading: false
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		this.requestPromos();
	}

	requestPromos() {
		this.setState({isLoading: true});

		xhr({
			url: '/api/promos/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				let promos = data.reduce((a, b) => {
					a.push({
						id: b.id,
						name: b.name
					});
					return a;
				}, []);
				promos = _.sortBy(promos, 'id');
				promos.unshift({
					id: 9999,
					name: 'Не выбран'
				});
				promos.unshift({
					id: 0,
					name: 'Любой'
				});
				this.setState({promos});
			}
		});
	}

	handleChange(value) {
		this.props.onChange(value);
	}

	render() {
		return (
			<Select
				options={this.state.promos}
				disabled={this.state.isLoading}
				selected={this.props.value}
				onChange={this.handleChange}
				valueType="Number"
				/>
		);
	}
}
PromoSelect.propTypes = {
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	onChange: React.PropTypes.func
};
PromoSelect.defaultProps = {
};

export default PromoSelect;
