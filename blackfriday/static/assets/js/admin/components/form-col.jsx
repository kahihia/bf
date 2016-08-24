/* eslint react/require-optimization: 0 */

import React from 'react';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormCol extends FormRow {
	render() {
		return (
			<label className={this.props.className}>
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
FormCol.propTypes = {
	className: React.PropTypes.string
};
FormCol.defaultProps = {
};

export default FormCol;
