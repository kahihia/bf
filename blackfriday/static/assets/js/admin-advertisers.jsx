/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import AdvertisersList from './admin/advertisers/advertisers-list.jsx';

(function () {
	'use strict';

	const block = document.getElementById('admin-advertisers');
	ReactDOM.render(<AdvertisersList/>, block);
})();
