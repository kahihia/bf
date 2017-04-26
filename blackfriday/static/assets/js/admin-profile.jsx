/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import MerchantProfileForm from './admin/common/merchant-profile-form.jsx';

(function () {
	'use strict';

	const AdminProfile = React.createClass({
		render() {
			return (
				<div>
					<MerchantProfileForm userId="current"/>
				</div>
			);
		}
	});

	const block = document.getElementById('admin-profile');
	ReactDOM.render(<AdminProfile/>, block);
})();
