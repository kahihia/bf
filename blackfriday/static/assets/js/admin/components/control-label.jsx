import React from 'react';

const ControlLabel = React.createClass({
	propTypes: {
		name: React.PropTypes.string.isRequired,
		className: React.PropTypes.string,
		required: React.PropTypes.bool
	},

	getDefaultProps() {
		return {
			required: false
		};
	},

	render() {
		let className = 'control-label';
		if (this.props.className) {
			className += ` ${this.props.className}`;
		}

		return (
			<span className={className}>
				{this.props.name}
				{this.props.required ? (
					<span>*</span>
				) : null}
				{':'}
			</span>
		);
	}
});

export default ControlLabel;
