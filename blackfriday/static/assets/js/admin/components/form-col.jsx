/* eslint react/require-optimization: 0 */
/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';
import classNames from 'classnames';
import FormRow from './form-row.jsx';

class FormCol extends FormRow {
	render() {
		const {
			className,
			hasError
		} = this.props;

		return (
			<label className={classNames('form-group', className, {'has-error': hasError})}>
				{this.renderLabel()}

				{this.renderInput()}

				{this.renderHelp()}

				{this.renderHelpError()}
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
