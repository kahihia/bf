/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import AdvertiserList from './admin/advertisers/advertiser-list.jsx';

(function () {
	'use strict';

	const block = document.getElementById('admin-advertisers');
	ReactDOM.render(<AdvertiserList/>, block);
})();
