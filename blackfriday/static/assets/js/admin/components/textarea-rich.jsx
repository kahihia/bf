/* global jQuery toastr */
/* eslint quote-props: ["error", "as-needed"] */
/* eslint react/require-optimization: 0 */

import React from 'react';

class TextareaRich extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			value: props.value
		};

		this.handleBlur = this.handleBlur.bind(this);
		this.handleChange = this.handleChange.bind(this);
	}

	componentWillReceiveProps(newProps) {
		this.setState({value: newProps.value});
	}

	componentDidMount() {
		const _this = this;

		jQuery(this.textarea).wysihtml5({
			toolbar: {
				'font-styles': true, // Font styling, e.g. h1, h2, etc
				emphasis: true, // Italics, bold, etc
				lists: true, // (Un)ordered lists, e.g. Bullets, Numbers
				html: false, // Button which allows you to edit the generated HTML
				link: true, // Button to insert a link
				image: false, // Button to insert an image
				color: false, // Button to change color of font
				blockquote: false, // Blockquote
				size: null // default: none, other options are xs, sm, lg
			},
			locale: 'ru-RU',
			events: {
				change: function () {
					const value = this.editableElement.value;
					if (_this.props.maxlength) {
						const length = value.replace(/<.*?>/gi, '').length;
						if (length > _this.props.maxlength) {
							toastr.warning(`Максимальная длина описания ${_this.props.maxlength} символов. Текущее описание составляет ${length} символов`);
							return;
						}
					}
					_this.handleChange(value);
				},
				blur: function () {
					const value = this.editableElement.value;
					if (_this.props.maxlength) {
						const length = value.replace(/<.*?>/gi, '').length;
						if (length > _this.props.maxlength) {
							toastr.warning(`Максимальная длина описания ${_this.props.maxlength} символов. Текущее описание составляет ${length} символов`);
							return;
						}
					}
					_this.handleBlur(value);
				}
			}
		});
	}

	handleChange(value) {
		this.setState({value}, () => {
			const ev = {
				target: {
					name: this.props.name,
					value
				}
			};
			if (this.props.onChange) {
				this.props.onChange(ev);
			}
		});
	}

	handleBlur(value) {
		this.setState({value}, () => {
			const ev = {
				target: {
					name: this.props.name,
					value
				}
			};
			if (this.props.onBlur) {
				this.props.onBlur(ev);
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
				className="form-control"
				ref={textarea}
				style={{width: '100%'}}
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
