/* global toastr */
/* eslint quote-props: ["error", "as-needed"] */
/* eslint react/require-optimization: 0 */

import React from 'react';
import MediumEditor from 'medium-editor';
require('node_modules/medium-editor/dist/css/medium-editor.css');
require('node_modules/medium-editor/dist/css/themes/bootstrap.css');

class TextareaRich extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};

		this.handleChange = this.handleChange.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({value: newProps.value}, this.initializeEditor);
	}

	componentDidMount() {
		this.initializeEditor();
	}

	initializeEditor() {
		if (this.editor) {
			this.editor.destroy();
		}

		this.editor = new MediumEditor(this.textarea, {
			toolbar: {
				buttons: [
					'bold',
					'italic',
					'underline',
					'strikethrough',
					'anchor',
					'orderedlist',
					'unorderedlist',
					'h2',
					'h3'
				]
			},
			targetBlank: true
		});

		this.editor.subscribe('blur', () => {
			const value = this.editor.getContent();
			if (this.validate(value)) {
				this.handleChange(value);
			}
		});
	}

	validate(value) {
		const {maxlength} = this.props;

		if (maxlength) {
			const length = value.replace(/<.*?>/gi, '').length;
			if (length > maxlength) {
				toastr.warning(`Максимальная длина описания ${maxlength} символов. Текущее описание составляет ${length} символов`);
				return false;
			}
		}

		return true;
	}

	handleChange(value) {
		this.setState({value}, () => {
			const ev = {
				target: {
					name: this.props.name,
					value
				}
			};
			if (this.props.onBlur) {
				this.props.onBlur(ev);
				return;
			}
			if (this.props.onChange) {
				this.props.onChange(ev);
			}
		});
	}

	render() {
		const {
			value
		} = this.state;

		const textarea = node => {
			this.textarea = node;
		};

		return (
			<textarea
				ref={textarea}
				value={value}
				/>
		);
	}
}
TextareaRich.propTypes = {
	onBlur: React.PropTypes.func,
	onChange: React.PropTypes.func,
	onKeyUp: React.PropTypes.func,
	maxlength: React.PropTypes.oneOfType([
		React.PropTypes.number,
		React.PropTypes.string
	]),
	name: React.PropTypes.string,
	value: React.PropTypes.string
};
TextareaRich.defaultProps = {
	value: ''
};

export default TextareaRich;
