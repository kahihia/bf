/* eslint react/require-optimization: 0 */

import React from 'react';

class Checkbox extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
	}

	handleChange() {
		this.props.onChange(!this.props.isChecked);
	}

	render() {
		const {
			disabled,
			isChecked,
			name,
			text
		} = this.props;

		return (
			<div className="checkbox">
				<label>
					<input
						type="checkbox"
						name={name}
						onChange={this.handleChange}
						checked={Boolean(isChecked)}
						disabled={disabled}
						/>
					{text}
				</label>
			</div>
		);
	}
}
Checkbox.propTypes = {
	name: React.PropTypes.string,
	text: React.PropTypes.string.isRequired,
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	disabled: React.PropTypes.bool,
	isChecked: React.PropTypes.bool,
	onChange: React.PropTypes.func.isRequired
};
Checkbox.defaultProps = {
	isChecked: false
};

export default Checkbox;
