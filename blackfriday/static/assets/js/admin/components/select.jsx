import React from 'react';

const Select = React.createClass({
	propTypes: {
		options: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.object
		]),
		selected: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		valueType: React.PropTypes.string,
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
		const props = this.props;

		let value = e.target.value;
		if (props.valueType === 'Number') {
			value = parseInt(value, 10);
		}

		props.onChange(value);
	},

	render() {
		const {options, selected, disabled, ...props} = this.props;

		let o = options;
		if (!Array.isArray(options)) {
			o = Object.keys(options).map(key => ({
				id: key,
				name: options[key]
			}));
		}

		return (
			<select
				className="form-control"
				onChange={this.handleChange}
				value={String(selected)}
				disabled={disabled}
				style={props.style}
				>
				{o.map(option => (
					<option
						key={option.id}
						value={option.id}
						disabled={option.disabled}
						>
						{option.name}
					</option>
				))}
			</select>
		);
	}
});

export default Select;
