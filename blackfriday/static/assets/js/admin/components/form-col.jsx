/* eslint react/require-optimization: 0 */
/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';
import classNames from 'classnames';
import ControlLabel from './control-label.jsx';
import FormRow, {Input} from './form-row.jsx';

class FormCol extends FormRow {
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
			<label className={classNames('form-group', this.props.className, {'has-error': hasError})}>
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

				{helpError ? (
					<span className="help-block">
						{helpError}
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
