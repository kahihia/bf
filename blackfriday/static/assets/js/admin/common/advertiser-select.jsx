/* global _ */
/* eslint react/require-optimization: 0 */

import React from 'react';
import xhr from 'xhr';
import Select from '../components/select.jsx';

class AdvertiserSelect extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			advertisers: [],
			isLoading: false
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentDidMount() {
		this.requestAdvertisers();
	}

	requestAdvertisers() {
		this.setState({isLoading: true});

		xhr({
			url: '/api/advertisers/',
			method: 'GET',
			json: true
		}, (err, resp, data) => {
			this.setState({isLoading: false});

			if (!err && resp.statusCode === 200) {
				let advertisers = data.reduce((a, b) => {
					a.push({
						id: b.id,
						name: `${b.name} (${b.email})`
					});
					return a;
				}, []);
				advertisers = _.sortBy(advertisers, 'name');
				advertisers.unshift({
					id: 0,
					name: 'Любой'
				});
				this.setState({advertisers});
			}
		});
	}

	handleChange(value) {
		this.props.onChange(value);
	}

	render() {
		return (
			<Select
				options={this.state.advertisers}
				disabled={this.state.isLoading || this.props.disabled}
				selected={this.props.value}
				onChange={this.handleChange}
				valueType="Number"
				/>
		);
	}
}
AdvertiserSelect.propTypes = {
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	onChange: React.PropTypes.func,
	disabled: React.PropTypes.bool
};
AdvertiserSelect.defaultProps = {
};

export default AdvertiserSelect;
