/* global window document */

require('css/admin.styl');
require('node_modules/react-datepicker/dist/react-datepicker.css');

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
	'use strict';

	const merchantLimitsWarning = document.getElementById('merchant-limits-warning');
	if (merchantLimitsWarning) {
		let MerchantLimitsWarning = require('./admin/advertiser/merchant-limits-warning');
		window.renderMerchantLimitsWarning = function (cb) {
			ReactDOM.render(<MerchantLimitsWarning success={cb}/>, merchantLimitsWarning);
		};
	}
})();
