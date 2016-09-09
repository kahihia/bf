/* eslint react/require-optimization: 0 */

import React from 'react';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormCol extends FormRow {
	render() {
		const {label, readOnly, required, value, placeholder, options, type, name, mask, help} = this.props;

		return (
			<label className={this.props.className}>
				<ControlLabel
					name={label}
					required={!readOnly && required}
					/>

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
