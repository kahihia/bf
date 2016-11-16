/* global window */

import React from 'react';
import Waypoint from 'react-waypoint';

class LoadMore extends React.Component {
	constructor(props) {
		super(props);
		this.state = {};

		this.handleWaypointEnter = this.handleWaypointEnter.bind(this);
	}

	handleWaypointEnter(props) {
		if (!props.event) {
			return;
		}
		this.props.onClick();
	}

	render() {
		let content = (<div className="load-more-waypoint-placeholder"/>);
		if (window.pageYOffset === undefined) {
			// If it IE8 show button
			content = (<LoadMoreBtn {...this.props}/>);
		} else if (!this.props.disabled) {
			content = (<Waypoint onEnter={this.handleWaypointEnter}/>);
		}
		return content;
	}
}
LoadMore.propTypes = {
	disabled: React.PropTypes.bool,
	onClick: React.PropTypes.func,
	text: React.PropTypes.string
};

class LoadMoreBtn extends React.Component {
	render() {
		return (
			<div className="load-more-btn-placeholder">
				<button
					onClick={this.props.onClick}
					type="button"
					className="load-more-btn"
					disabled={this.props.disabled}
					>
					<span>
						{this.props.text}
					</span>
				</button>
			</div>
		);
	}
}
LoadMoreBtn.propTypes = {
	disabled: React.PropTypes.bool,
	onClick: React.PropTypes.func,
	text: React.PropTypes.string
};

export default LoadMore;
