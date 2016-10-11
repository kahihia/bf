/* eslint react/require-optimization: 0 */

import React from 'react';

class Radio extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange() {
		this.props.onChange(this.props.value);
	}

	getLabelText() {
		const props = this.props;

		if (props.nameActive && props.isChecked) {
			return props.nameActive;
		}

		return props.name;
	}

	render() {
		return (
			<div className="radio">
				<label>
					<input
						type="radio"
						onChange={this.handleChange}
						checked={this.props.isChecked}
						disabled={this.props.disabled}
						/>
					{this.getLabelText()}
				</label>
			</div>
		);
	}
}
Radio.propTypes = {
	name: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.node,
		React.PropTypes.func
	]).isRequired,
	nameActive: React.PropTypes.string,
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	disabled: React.PropTypes.bool,
	isChecked: React.PropTypes.bool,
	onChange: React.PropTypes.func.isRequired
};
Radio.defaultProps = {
	isChecked: false
};

export default Radio;
