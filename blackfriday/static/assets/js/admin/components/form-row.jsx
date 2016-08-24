/* eslint react/require-optimization: 0 */

import React from 'react';
import MaskedInput from 'react-maskedinput';
import ControlLabel from './control-label.jsx';

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
		return (
			<label className="form-group">
				<ControlLabel
					name={this.props.label}
					required={!this.props.readOnly && this.props.required}
					/>

				<Input
					className="form-control"
					value={this.props.value}
					type={this.props.type}
					name={this.props.name}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					required={this.props.required}
					readOnly={this.props.readOnly}
					mask={this.props.mask}
					/>

				{this.props.help ? (
					<span className="help-block">
						{this.props.help}
					</span>
				) : null}
			</label>
		);
	}
}
FormRow.propTypes = {
	label: React.PropTypes.string.isRequired,
	value: React.PropTypes.string.isRequired,
	name: React.PropTypes.string,
	type: React.PropTypes.string,
	onChange: React.PropTypes.func.isRequired,
	onKeyUp: React.PropTypes.func,
	required: React.PropTypes.bool,
	readOnly: React.PropTypes.bool,
	help: React.PropTypes.string,
	mask: React.PropTypes.string
};
FormRow.defaultProps = {
	type: 'text',
	required: false,
	readOnly: false
};

export default FormRow;

export const Input = React.createClass({
	propTypes: {
		value: React.PropTypes.string.isRequired,
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
		this.props.onChange(e);
	},

	handleKeyUp(e) {
		if (!this.props.onKeyUp) {
			return;
		}
		this.props.onKeyUp(e);
	},

	render() {
		const {value, name, type, required, readOnly, mask} = this.props;

		if (this.props.mask) {
			return (
				<MaskedInput
					className="form-control"
					{...{value, name, required, readOnly, mask}}
					onChange={this.handleChange}
					onKeyUp={this.handleKeyUp}
					/>
			);
		}

		return (
			<input
				className="form-control"
				{...{value, name, type, required, readOnly}}
				onChange={this.handleChange}
				onKeyUp={this.handleKeyUp}
				/>
		);
	}
});
