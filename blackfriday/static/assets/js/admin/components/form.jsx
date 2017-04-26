/* global _ toastr */
/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import FormRow from '../components/form-row.jsx';
import FormCol from '../components/form-col.jsx';

class Form extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			isChanged: false,
			isLoading: false,
			fields: {
			},
			cache: {
			}
		};
		this.handleChange = this.handleChange.bind(this);
	}

	resetForm() {
		this.setState(previousState => {
			const fields = previousState.fields;
			_.forEach(fields, field => {
				let value = '';
				if (!_.isUndefined(field.defaultValue)) {
					value = field.defaultValue;
				}

				field.value = value;
			});

			return previousState;
		});
	}

	validate(warnings) {
		let isValid = true;

		const {fields} = this.state;
		_.forEach(fields, field => {
			const {pattern, required, value, label} = field;
			const isEmpty = (_.isUndefined(value) || _.isNull(value) || value === '');
			if (required) {
				if (isEmpty) {
					isValid = false;
					if (warnings) {
						toastr.warning(`Заполните поле "${label}"`);
					}
					return false;
				} else if (pattern) {
					let test = new RegExp(pattern);
					if (!test.test(value)) {
						isValid = false;
						if (warnings) {
							toastr.warning(`Неверный формат поля "${label}"`);
						}
					}
				}
			}
		});

		return isValid;
	}

	handleChange(e) {
		const target = e.target;
		this.updateData(target.name, target.value);
	}

	updateData(name, value) {
		this.setState(previousState => {
			previousState.isChanged = true;
			const fields = previousState.fields;
			const field = fields[name];
			field.value = value;

			if (field.hasError) {
				field.hasError = false;
				field.helpError = null;
			}

			return previousState;
		});
	}

	getDataPatch() {
		const {cache} = this.state;
		const newData = this.serialize();

		return _.reduce(newData, (patch, value, key) => {
			if (value !== cache[key]) {
				patch[key] = value;
			}
			return patch;
		}, {});
	}

	buildRow(name) {
		const {
			fields,
			isLoading
		} = this.state;
		const field = fields[name];

		return (
			<FormRow
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				disabled={isLoading}
				{...{name}}
				{...field}
				/>
		);
	}

	buildCol(name) {
		const {
			fields,
			isLoading
		} = this.state;
		const field = fields[name];

		return (
			<FormCol
				className="col-xs-6"
				onChange={this.handleChange}
				readOnly={this.props.readOnly}
				disabled={isLoading}
				{...{name}}
				{...field}
				/>
		);
	}

	serialize(fields = this.state.fields) {
		return _.reduce(fields, (json, field, name) => {
			if (!field.excluded) {
				json[name] = field.value;
			}
			return json;
		}, {});
	}

	processErrors(errors) {
		const fields = this.state.fields;

		processErrors(errors, (error, label) => {
			const field = fields[label];
			if (field) {
				if (error === 'exact_width') {
					error = 'Неподходящая шинина картинки';
				} else if (error === 'exact_height') {
					error = 'Неподходящая высота картинки';
				}
				field.helpError = error;
				field.hasError = true;
				return;
			}
			toastr.warning(error);
		});
		this.forceUpdate();
	}
}
Form.propTypes = {
	onSubmit: React.PropTypes.func,
	readOnly: React.PropTypes.bool
};
Form.defaultProps = {
};

export default Form;

function processErrors(errors, cb) {
	process(errors, null, cb);
}

function process(errors, label, cb) {
	if (_.isArray(errors)) {
		processArray(errors, label, cb);
	} else if (_.isObject(errors)) {
		processObject(errors, cb);
	} else if (_.isString(errors)) {
		processString(errors, label, cb);
	}
}

function processObject(errors, cb) {
	_.forEach(errors, (error, label) => {
		process(error, label, cb);
	});
}

function processArray(errors, label, cb) {
	_.forEach(errors, error => {
		process(error, label, cb);
	});
}

function processString(error, label, cb) {
	cb(error, label);
}
