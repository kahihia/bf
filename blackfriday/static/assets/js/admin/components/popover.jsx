/* global jQuery */

import React from 'react';

const Popover = React.createClass({
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		title: React.PropTypes.string,
		content: React.PropTypes.string
	},

	componentDidMount() {
		jQuery(this.popover).popover();
	},

	componentWillUnmount() {
		jQuery(this.popover).popover('destroy');
	},

	render() {
		const popover = ref => {
			this.popover = ref;
		};

		return (
			<span
				ref={popover}
				className={this.props.className}
				title={this.props.title}
				data-content={this.props.content}
				data-toggle="popover"
				data-trigger="hover"
				>
				{this.props.children}
			</span>
		);
	}
});

export default Popover;
