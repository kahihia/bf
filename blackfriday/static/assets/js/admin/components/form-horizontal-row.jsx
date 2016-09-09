/* eslint react/require-optimization: 0 */

import React from 'react';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormHorizontalRow extends FormRow {
	render() {
		const {label, readOnly, required, value, placeholder, options, type, name, mask, help} = this.props;

		return (
			<label className="form-group">
				<ControlLabel
					name={label}
					className="col-sm-2"
					required={!readOnly && required}
					/>

				<div className="col-sm-10">
					<Input
						onChange={this.handleChange}
						onKeyUp={this.handleKeyUp}
						{...{value, placeholder, options, type, name, required, readOnly, mask}}
						/>

					{help ? (
						<span className="help-block">
							{help}
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
