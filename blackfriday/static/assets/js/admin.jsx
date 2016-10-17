/* global window document */

require('css/admin.styl');
require('node_modules/react-datepicker/dist/react-datepicker.css');

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
	'use strict';

	const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

	const pageAddShop = document.getElementById('page-add-shop');
	if (pageAddShop) {
		let PageAddShop = require('./admin/advertiser/page-add-shop');
		ReactDOM.render(<PageAddShop/>, pageAddShop);
	}

	const pageMerchantProfile = document.getElementById('page-merchant-profile');
	if (pageMerchantProfile) {
		let PageMerchantProfile = require('./admin/advertiser/page-merchant-profile');
		ReactDOM.render(<PageMerchantProfile userId={ENV.userId}/>, pageMerchantProfile);
	}

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

	const promoList = document.getElementById('promo-list');
	if (promoList) {
		let PromoList = require('./admin/administrator/promo-list').PromoList;
		ReactDOM.render(<PromoList/>, promoList);
	}

	const promoMaker = document.getElementById('promo-maker');
	if (promoMaker) {
		let PromoMaker = require('./admin/promo/promo-maker').PromoMaker;
		ReactDOM.render(<PromoMaker/>, promoMaker);
	}

	const feedMaker = document.getElementById('feed-maker');
	if (feedMaker) {
		let FeedMaker = require('./admin/catalog/feed-maker');
		ReactDOM.render(<FeedMaker/>, feedMaker);
	}

	const moderateList = document.getElementById('moderate-list');
	if (moderateList) {
		let ModerateList = require('./admin/manager/moderate-list').ModerateList;
		ReactDOM.render(<ModerateList/>, moderateList);
	}
})();
