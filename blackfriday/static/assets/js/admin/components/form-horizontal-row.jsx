/* eslint react/require-optimization: 0 */
/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';
import classNames from 'classnames';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormHorizontalRow extends FormRow {
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
			value
		} = this.props;

		return (
			<label className={classNames('form-group', {'has-error': hasError})}>
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

					{helpError ? (
						<span className="help-block">
							{helpError}
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
