/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';
import classNames from 'classnames';
import ControlLabel from './control-label.jsx';
import FormRow from './form-row.jsx';

class FormHorizontalRow extends FormRow {
	render() {
		const {
			hasError,
			label,
			readOnly,
			required
		} = this.props;

		return (
			<label className={classNames('form-group', {'has-error': hasError})}>
				<ControlLabel
					name={label}
					className="col-sm-2"
					required={!readOnly && required}
					/>

				<div className="col-sm-10">
					{this.renderInput()}

					{this.renderHelp()}

					{this.renderHelpError()}
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
