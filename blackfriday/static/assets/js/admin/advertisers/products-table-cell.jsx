/* global _ */
/* eslint camelcase: ["error", {properties: "never"}] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import b from 'b_';
import Popover from '../components/popover.jsx';
import Glyphicon from '../components/glyphicon.jsx';

const className = 'products-table';

class ProductsTableCell extends React.Component {
	hasErrors(name) {
		const {errors} = this.props;
		return Boolean(errors[name]);
	}

	hasWarnings(name) {
		const {warnings} = this.props;
		return Boolean(warnings[name]);
	}

	getClassName(name) {
		if (this.hasErrors(name)) {
			return 'bg-danger';
		}

		if (this.hasWarnings(name)) {
			return 'bg-warning';
		}

		return '';
	}

	render() {
		const {
			children,
			disabled,
			errors,
			names,
			warnings
		} = this.props;

		let errorClassName = '';
		_.forEach(names, name => {
			const className = this.getClassName(name);
			if (className) {
				errorClassName = className;
				return false;
			}
		});

		return (
			<td className={(disabled ? 'active ' : '') + errorClassName + ' ' + b(className, 'table-td', {name: names[0].toLowerCase()})}>
				{names.map(name => (
					<ErrorNotification
						key={name}
						{...{
							errors,
							name,
							warnings
						}}
						/>
				))}

				{children}
			</td>
		);
	}
}
ProductsTableCell.propTypes = {
	children: React.PropTypes.any,
	disabled: React.PropTypes.bool,
	errors: React.PropTypes.object,
	names: React.PropTypes.array,
	warnings: React.PropTypes.object
};
ProductsTableCell.defaultProps = {
	errors: [],
	warnings: []
};

export default ProductsTableCell;

class ErrorNotification extends React.Component {
	render() {
		const {
			errors,
			warnings,
			name
		} = this.props;

		if (!errors[name] && !warnings[name]) {
			return null;
		}

		return (
			<span>
				{errors[name] && errors[name].length ? (
					<Popover
						className="text-danger"
						placement="top"
						html="true"
						content={errorNotificationList(errors[name])}
						>
						<Glyphicon name="ban-circle"/>
					</Popover>
				) : null}

				{warnings[name] && warnings[name].length ? (
					<Popover
						className="text-warning"
						placement="top"
						html="true"
						content={errorNotificationList(warnings[name])}
						>
						<Glyphicon name="warning-sign"/>
					</Popover>
				) : null}
			</span>
		);
	}
}
ErrorNotification.propTypes = {
	name: React.PropTypes.string,
	errors: React.PropTypes.object,
	warnings: React.PropTypes.object
};
ErrorNotification.defaultProps = {
};

function errorNotificationList(errors) {
	let list = '<ul><li>';
	list += errors.join('</li><li>');
	list += '</li></ul>';
	return list;
}
