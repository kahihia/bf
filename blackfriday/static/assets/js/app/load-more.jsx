/* global window */

import React from 'react';
import Waypoint from 'react-waypoint';

class LoadMore extends React.Component {
	render() {
		let content = (<div className="load-more-waypoint-placeholder"/>);
		if (window.pageYOffset === undefined) {
			// If it IE8 show button
			content = (<LoadMoreBtn {...this.props}/>);
		} else if (!this.props.disabled) {
			content = (<Waypoint onEnter={this.props.onClick}/>);
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
