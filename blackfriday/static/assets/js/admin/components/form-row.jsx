/* eslint react/require-optimization: 0 */

import React from 'react';
import classNames from 'classnames';
import MaskedInput from 'react-maskedinput';
import ControlLabel from './control-label.jsx';
import Select from './select.jsx';

class FormRow extends React.Component {
	constructor() {
		super();
		this.handleChange = this.handleChange.bind(this);
		this.handleKeyUp = this.handleKeyUp.bind(this);
	}

	handleChange(e) {
		this.props.onChange(e);
	}

	handleKeyUp(e) {
		if (!this.props.onKeyUp) {
			return;
		}
		this.props.onKeyUp(e);
	}

	render() {
		const {
			hasError,
			help,
			helpError,
			label,
			mask,
			name,
			options,
			placeholder,
			readOnly,
			required,
			type,
			value,
			valueType
		} = this.props;

		return (
			<label className={classNames('form-group', {'has-error': hasError})}>
				<ControlLabel
					name={label}
					required={!readOnly && required}
					/>

				<Input
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					{...{value, valueType, placeholder, options, type, name, required, readOnly, mask}}
					/>

				{help ? (
					<span className="help-block">
						{help}
					</span>
				) : null}

				{helpError ? (
					<span className="help-block">
						{helpError}
					</span>
				) : null}
			</label>
		);
	}
}
FormRow.propTypes = {
	hasError: React.PropTypes.bool,
	help: React.PropTypes.oneOfType([
		React.PropTypes.string,
		React.PropTypes.node
	]),
	helpError: React.PropTypes.string,
	label: React.PropTypes.string.isRequired,
	mask: React.PropTypes.string,
	name: React.PropTypes.string,
	onChange: React.PropTypes.func.isRequired,
	onKeyUp: React.PropTypes.func,
	options: React.PropTypes.oneOfType([
		React.PropTypes.array,
		React.PropTypes.object
	]),
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
FormRow.defaultProps = {
	type: 'text',
	required: false,
	readOnly: false
};

export default FormRow;

export const Input = React.createClass({
	propTypes: {
		value: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.number
		]),
		valueType: React.PropTypes.string,
		placeholder: React.PropTypes.string,
		options: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.object
		]),
		name: React.PropTypes.string,
		type: React.PropTypes.string,
		onChange: React.PropTypes.func.isRequired,
		onKeyUp: React.PropTypes.func,
		required: React.PropTypes.bool,
		readOnly: React.PropTypes.bool,
		mask: React.PropTypes.string
	},

	getDefaultProps() {
		return {
			type: 'text',
			required: false,
			readOnly: false
		};
	},

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
	},

	handleKeyUp(e) {
		if (!this.props.onKeyUp) {
			return;
		}
		this.props.onKeyUp(e);
	},

	render() {
		const {
			mask,
			name,
			options,
			placeholder,
			readOnly,
			required,
			type,
			value,
			valueType
		} = this.props;

		let val = value === null ? valueType === 'Number' ? 0 : '' : value;

		if (type === 'select') {
			return (
				<Select
					onChange={this.handleChange}
					selected={val}
					{...{options, name, valueType}}
					/>
			);
		}

		if (mask) {
			return (
				<MaskedInput
					className="form-control"
					value={val}
					{...{name, required, readOnly, mask}}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					/>
			);
		}

		return (
			<input
				className="form-control"
				value={val}
				{...{placeholder, name, type, required, readOnly}}
				onChange={this.handleChange}
				onKeyUp={this.handleKeyUp}
				/>
		);
	}
});
