import React from 'react';
import Cookie from 'js-cookie';
import {ENV} from './utils.js';

const ADMITAD_REGEX = /ad.admitad.com/;

const Link = React.createClass({
	propTypes: {
		children: React.PropTypes.node,
		className: React.PropTypes.string,
		href: React.PropTypes.string.isRequired,
		isExternal: React.PropTypes.bool,
		onClick: React.PropTypes.func,
		style: React.PropTypes.object,
		title: React.PropTypes.string
	},

	handleClick(e) {
		if (!this.props.onClick) {
			return;
		}

		this.props.onClick(e);
	},

	render() {
		const props = this.props;

		let href = props.href;
		if (props.isExternal) {
			href = `${ENV.redirectPrefix}${href}`;

			if (ADMITAD_REGEX.test(href)) {
				href += getAdmitadAddition();
			}
		}

		return (
			<a
				className={props.className || ''}
				href={href}
				title={props.title}
				style={props.style}
				target={props.isExternal ? '_blank' : ''}
				onClick={this.handleClick}
				rel="nofollow"
				>
				{props.children}
			</a>
		);
	}
});

export default Link;

function getAdmitadAddition() {
	const subid4 = Cookie.get('subid4');
	if (!subid4) {
		return '';
	}
	return '/subid4=' + subid4;
}
