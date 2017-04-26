import React from 'react';
import {Sortable as sortable} from 'react-sortable';

const LandingLogoListItem = React.createClass({
	propTypes: {
		children: React.PropTypes.any
	},

	getDefaultProps() {
		return {};
	},

	render() {
		const {children, ...props} = this.props;

		return (
			<div
				{...props}
				className="landing-logo-list__item"
				>
				{children}
			</div>
		);
	}
});

const SortableLandingLogoListItem = sortable(LandingLogoListItem);

export default SortableLandingLogoListItem;
