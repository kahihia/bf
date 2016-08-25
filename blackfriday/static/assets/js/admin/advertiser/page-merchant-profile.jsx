/* eslint camelcase: ["error", {properties: "never"}] */

import React from 'react';
import MerchantProfileForm from '../common/merchant-profile-form.jsx';

const PageMerchantProfile = React.createClass({
	propTypes: {
		userId: React.PropTypes.number.isRequired,
		readOnly: React.PropTypes.bool
	},

	render() {
		return (
			<MerchantProfileForm {...this.props}/>
		);
	}
});

export default PageMerchantProfile;
