/* global jQuery */

import React from 'react';

const Popover = React.createClass({
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		content: React.PropTypes.string,
		html: React.PropTypes.string,
		placement: React.PropTypes.string,
		title: React.PropTypes.string
	},

	componentDidMount() {
		jQuery(this.popover).popover();
	},

	componentWillUnmount() {
		jQuery(this.popover).popover('destroy');
	},

	render() {
		const {
			children,
			className,
			content,
			html,
			placement,
			title
		} = this.props;
		const popover = ref => {
			this.popover = ref;
		};

		return (
			<span
				ref={popover}
				className={className}
				title={title}
				data-content={content}
				data-html={html}
				data-placement={placement}
				data-toggle="popover"
				data-trigger="hover"
				>
				{children}
			</span>
		);
	}
});

export default Popover;
