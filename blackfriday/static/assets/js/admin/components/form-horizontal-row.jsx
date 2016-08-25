/* eslint react/require-optimization: 0 */

import React from 'react';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormHorizontalRow extends FormRow {
	render() {
		return (
			<label className="form-group">
				<ControlLabel
					name={this.props.label}
					className="col-sm-2"
					required={!this.props.readOnly && this.props.required}
					/>
				<div className="col-sm-10">
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
				</div>
			</label>
		);
	}
}
FormHorizontalRow.propTypes = {
};
FormHorizontalRow.defaultProps = {
};

export default FormHorizontalRow;
