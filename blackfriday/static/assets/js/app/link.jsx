/* global React, window */

import Cookie from 'js-cookie';

const ADMITAD_REGEX = /ad.admitad.com/;

const Link = React.createClass({
	propTypes: {
		href: React.PropTypes.string.isRequired,
		className: React.PropTypes.string,
		children: React.PropTypes.node.isRequired,
		isExternal: React.PropTypes.bool,
		onClick: React.PropTypes.func
	},

	handleClick() {
		if (!this.props.onClick) {
			return;
		}

		this.props.onClick();
	},

	render() {
		const props = this.props;

		let href = props.href;
		if (props.isExternal) {
			href = `${window.ENV.redirectPrefix}${href}`;

			if (ADMITAD_REGEX.test(href)) {
				href += getAdmitadAddition();
			}
		}

		return (
			<a
				className={props.className || ''}
				href={href}
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
