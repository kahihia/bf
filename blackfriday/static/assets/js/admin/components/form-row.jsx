/* eslint react/require-optimization: 0 */

import React from 'react';
import classNames from 'classnames';
import ControlLabel from './control-label.jsx';
import Input from './input.jsx';

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

	renderLabel() {
		const {label, readOnly, required} = this.props;

		return (
			<ControlLabel
				name={label}
				required={!readOnly && required}
				/>
		);
	}

	renderInput() {
		const {
			accept,
			addon,
			disabled,
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
			<Input
				onChange={this.handleChange}
				onKeyUp={this.handleKeyUp}
				{...{
					accept,
					addon,
					disabled,
					mask,
					name,
					options,
					placeholder,
					readOnly,
					required,
					type,
					value,
					valueType
				}}
				/>
		);
	}

	renderHelp() {
		const {help} = this.props;

		if (!help) {
			return null;
		}

		return (
			<span className="help-block">
				{help}
			</span>
		);
	}

	renderHelpError() {
		const {helpError} = this.props;

		if (!helpError) {
			return null;
		}

		return (
			<span className="help-block">
				{helpError}
			</span>
		);
	}

	render() {
		const {hasError} = this.props;

		return (
			<label className={classNames('form-group', {'has-error': hasError})}>
				{this.renderLabel()}

				{this.renderInput()}

				{this.renderHelp()}

				{this.renderHelpError()}
			</label>
		);
	}
}
FormRow.propTypes = {
	accept: React.PropTypes.string,
	addon: React.PropTypes.string,
	disabled: React.PropTypes.bool,
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
	disabled: false,
	type: 'text',
	required: false,
	readOnly: false
};

export default FormRow;
