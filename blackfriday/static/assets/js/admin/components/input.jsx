/* eslint react/require-optimization: 0 */

import React from 'react';
import MaskedInput from 'react-maskedinput';
import Select from './select.jsx';

class Input extends React.Component {
	constructor(props) {
		super(props);
		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
	}

	handleBlur(e) {
		if (!this.props.onBlur) {
			return;
		}
		this.props.onBlur(e);
	}

	handleChange(e) {
		let ev = e;

		if (this.props.type === 'select') {
			ev = {
				target: {
					name: this.props.name,
					value: e
				}
			};
		}

		this.props.onChange(ev);
	}

	handleKeyUp(e) {
		if (!this.props.onKeyUp) {
			return;
		}
		this.props.onKeyUp(e);
	}

	render() {
		const {
			accept,
			addon,
			disabled,
			mask,
			name,
			options,
			pattern,
			placeholder,
			readOnly,
			required,
			type,
			value,
			valueType
		} = this.props;

		let val = value;
		if (value === null) {
			if (valueType === 'Number') {
				val = 0;
			} else {
				val = '';
			}
		}

		let input;
		if (type === 'select') {
			input = (
				<Select
					onChange={this.handleChange}
					selected={val}
					{...{disabled, options, name, valueType}}
					/>
			);
		} else if (type === 'textarea') {
			input = (
				<textarea
					className="form-control"
					value={val}
					{...{accept, disabled, placeholder, name, type, required, readOnly}}
					onBlur={this.handleBlur}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					/>
			);
		} else if (mask) {
			input = (
				<MaskedInput
					className="form-control"
					value={val}
					{...{disabled, name, required, readOnly, mask}}
					onBlur={this.handleBlur}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					/>
			);
		} else {
			input = (
				<input
					className="form-control"
					value={val}
					{...{accept, disabled, pattern, placeholder, name, type, required, readOnly}}
					onBlur={this.handleBlur}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					/>
			);
		}

		if (addon) {
			return (
				<div className="input-group">
					<span className="input-group-addon">
						{addon}
					</span>
					{input}
				</div>
			);
		}

		return input;
	}
}
Input.propTypes = {
	accept: React.PropTypes.string,
	addon: React.PropTypes.string,
	disabled: React.PropTypes.bool,
	mask: React.PropTypes.string,
	name: React.PropTypes.string,
	onBlur: React.PropTypes.func,
	onChange: React.PropTypes.func.isRequired,
	onKeyUp: React.PropTypes.func,
	options: React.PropTypes.oneOfType([
		React.PropTypes.array,
		React.PropTypes.object
	]),
	pattern: React.PropTypes.string,
	placeholder: React.PropTypes.string,
	readOnly: React.PropTypes.bool,
	required: React.PropTypes.bool,
	type: React.PropTypes.string,
	value: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.number
	]),
	valueType: React.PropTypes.string
};
Input.defaultProps = {
	readOnly: false,
	required: false,
	type: 'text'
};

export default Input;
