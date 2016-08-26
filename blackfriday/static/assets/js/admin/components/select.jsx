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

		let o = options;
		if (!Array.isArray(options)) {
			o = Object.keys(options).map(key => {
				return {
					id: key,
					name: options[key]
				};
			});
		}

		return (
			<select
				className="form-control"
				onChange={this.handleChange}
				value={selected}
				disabled={disabled}
				style={props.style}
				>
				{o.map(option => {
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
