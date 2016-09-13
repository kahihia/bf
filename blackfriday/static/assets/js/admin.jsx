/* global window document */

require('css/admin.styl');
require('node_modules/react-datepicker/dist/react-datepicker.css');

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
	'use strict';

	const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

	const merchantShopList = document.getElementById('merchant-shop-list');
	if (merchantShopList) {
		let MerchantShopList = require('./admin/advertiser/merchant-shop-list');
		ReactDOM.render(<MerchantShopList/>, merchantShopList);
	}

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

	const pageMerchantInvoices = document.getElementById('page-merchant-invoices');
	if (pageMerchantInvoices) {
		let PageMerchantInvoices = require('./admin/advertiser/page-merchant-invoices');
		ReactDOM.render(<PageMerchantInvoices/>, pageMerchantInvoices);
	}

	// Рендер таблицы загруженных товаров
	const shopGoodsControl = document.getElementById('shop-goods-control');
	if (shopGoodsControl) {
		let ShopGoodsControl = require('./admin/advertiser/shop-goods-control');
		ReactDOM.render(<ShopGoodsControl/>, shopGoodsControl);
	}

	// Рендер таблицы загрузки товаров
	const shopUploadedGoods = document.getElementById('shop-uploaded-goods');
	if (shopUploadedGoods) {
		let ShopUploadedGoods = require('./admin/advertiser/shop-uploaded-goods');
		window.renderShopUploadedGoods = function (data) {
			ReactDOM.render(<ShopUploadedGoods data={data}/>, shopUploadedGoods);
		};
	}

	// Рендер кастомных фонов
	const customBackground = document.getElementById('custom-background');
	if (customBackground) {
		let CustomBackground = require('./admin/advertiser/custom-background');
		const merchantId = customBackground.dataset.merchantId;
		ReactDOM.render(<CustomBackground merchantId={merchantId}/>, customBackground);
	}

	// Рендер блока изменения выбора тарифа
	const shopEditPlanSelect = document.getElementById('shop-edit-plan-select');
	if (shopEditPlanSelect) {
		let ShopEditPlanSelect = require('./admin/advertiser/shop-edit-plan-select');
		window.renderShopEditPlanSelect = function (shopId, invoiceStatus) {
			ReactDOM.render(<ShopEditPlanSelect {...{shopId, invoiceStatus}}/>, shopEditPlanSelect);
		};
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
		let PromoMaker = require('./admin/administrator/promo-maker').PromoMaker;
		ReactDOM.render(<PromoMaker/>, promoMaker);
	}

	const invoiceList = document.getElementById('invoice-list');
	if (invoiceList) {
		let InvoiceList = require('./admin/administrator/invoice-list').InvoiceList;
		ReactDOM.render(<InvoiceList/>, invoiceList);
	}

	const feedMaker = document.getElementById('feed-maker');
	if (feedMaker) {
		let FeedMaker = require('./admin/administrator/feed-maker');
		ReactDOM.render(<FeedMaker/>, feedMaker);
	}

	const moderateList = document.getElementById('moderate-list');
	if (moderateList) {
		let ModerateList = require('./admin/manager/moderate-list').ModerateList;
		ReactDOM.render(<ModerateList/>, moderateList);
	}
})();
