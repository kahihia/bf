import React from 'react';

const Select = React.createClass({
	propTypes: {
		options: React.PropTypes.array,
		selected: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		onChange: React.PropTypes.func,
		disabled: React.PropTypes.bool
	},

	getDefaultProps() {
		return {};
	},

	getInitialState() {
		return {};
	},

	handleChange(e) {
		this.props.onChange(e.target.value);
	},

	render() {
		const {options, selected, disabled, ...props} = this.props;

		return (
			<select
				className="form-control"
				onChange={this.handleChange}
				value={selected}
				disabled={disabled}
				style={props.style}
				>
				{options.map(option => {
					return (
						<option
							key={option.id}
							value={option.id}
							>
							{option.name}
						</option>
					);
				})}
			</select>
		);
	}
});

export default Select;
