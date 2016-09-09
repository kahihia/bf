/* global _ */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import FormRow from '../components/form-row.jsx';
import FormCol from '../components/form-col.jsx';

class Form extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isLoading: false,
			fields: {
			}
		};
		this.handleChange = this.handleChange.bind(this);
	}

	resetForm() {
		const fields = this.state.fields;
		_.forEach(fields, field => {
			let value = '';
			if (!_.isUndefined(field.defaultValue)) {
				value = field.defaultValue;
			}

			field.value = value;
		});
		this.forceUpdate();
	}

	handleChange(e) {
		const target = e.target;
		this.updateData(target.name, target.value);
	}

	updateData(name, value) {
		const fields = this.state.fields;
		fields[name].value = value;
		this.forceUpdate();
	}

	buildRow(name) {
		const field = this.state.fields[name];

		return (
			<FormRow
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name}}
				{...field}
				/>
		);
	}

	buildCol(name) {
		const field = this.state.fields[name];

		return (
			<FormCol
				className="col-xs-6"
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				{...{name}}
				{...field}
				/>
		);
	}

	serialize() {
		const fields = this.state.fields;
		const json = _.reduce(fields, (a, b, key) => {
			if (!b.excluded) {
				a[key] = b.value;
			}

			return a;
		}, {});

		return json;
	}
}
Form.propTypes = {
	onSubmit: React.PropTypes.func,
	readOnly: React.PropTypes.bool
};
Form.defaultProps = {
};

export default Form;