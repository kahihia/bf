/* global window */
/* eslint quote-props: ["error", "as-needed"] */

import React from 'react';

class Recaptcha extends React.Component {
	componentDidMount() {
		setTimeout(() => {
			this.renderRecaptcha();
		}, 500);
	}

	shouldComponentUpdate() {
		return false;
	}

	renderRecaptcha() {
		const {elementId, sitekey, onVerify, onExpire} = this.props;

		if (window.grecaptcha) {
			window.grecaptcha.render(elementId, {
				callback: onVerify,
				'expired-callback': onExpire,
				sitekey
			});
		}
	}

	render() {
		return (
			<div id={this.props.elementId}/>
		);
	}
}
Recaptcha.propTypes = {
	elementId: React.PropTypes.string,
	sitekey: React.PropTypes.string,
	onVerify: React.PropTypes.func,
	onExpire: React.PropTypes.func
};
Recaptcha.defaultProps = {
};

export default Recaptcha;
