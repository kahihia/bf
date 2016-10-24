/* global window document */

require('css/admin.styl');
require('node_modules/react-datepicker/dist/react-datepicker.css');

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
	'use strict';

	// Рендер кастомных фонов
	const customBackground = document.getElementById('custom-background');
	if (customBackground) {
		let CustomBackground = require('./admin/advertiser/custom-background');
		const merchantId = customBackground.dataset.merchantId;
		ReactDOM.render(<CustomBackground merchantId={merchantId}/>, customBackground);
	}

	const merchantLimitsWarning = document.getElementById('merchant-limits-warning');
	if (merchantLimitsWarning) {
		let MerchantLimitsWarning = require('./admin/advertiser/merchant-limits-warning');
		window.renderMerchantLimitsWarning = function (cb) {
			ReactDOM.render(<MerchantLimitsWarning success={cb}/>, merchantLimitsWarning);
		};
	}
})();
