/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import {hasRole} from './admin/utils.js';

(function () {
	'use strict';

	const block = document.getElementById('admin-invoices');

	if (hasRole('advertiser')) {
		const AdvertiserInvoiceList = require('./admin/orders/advertiser-invoice-list.jsx');
		ReactDOM.render(<AdvertiserInvoiceList/>, block);
	} else {
		const InvoiceList = require('./admin/orders/invoice-list.jsx').InvoiceList;
		ReactDOM.render(<InvoiceList/>, block);
	}
})();
