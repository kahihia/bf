/* global React, _, $ */
/* eslint camelcase: ["error", {properties: "never"}] */

import {getLimit} from './limits.js';

const TYPES = {
	logo: 'logo',
	goods: 'goods',
	banner: 'banner',
	superbanner: 'superbanner',
	verticalbanner: 'verticalbanner',
	background: 'background'
};

const TYPES_NAMES = {
	logo: 'Логотип',
	goods: 'Товар',
	banner: 'Баннер',
	superbanner: 'Супербаннер',
	verticalbanner: 'Вертикальный баннер',
	background: 'Брендирование фона'
};

const PLACES = {
	at_cat: 'at_cat',
	on_main: 'on_main',
	at_mailing: 'at_mailing'
};

const PLACES_NAMES = {
	at_cat: 'в категории',
	on_main: 'на главной',
	at_mailing: 'в рассылке',
	teaser: 'тизер',
	teaser_on_main: 'тизер на главной'
};

const ADDITIONAL = {
	additional: 'additional'
};

const MerchantLimitsWarning = React.createClass({
	propTypes: {
		success: React.PropTypes.func
	},

	getInitialState() {
		const s = {};
		_.forEach(TYPES, type => {
			const t = {};
			const limits = {};
			let count = 0;

			_.forEach(PLACES, place => {
				let limit = getLimit(type + '_' + place);
				limit = limit === true ? 1 : limit;
				let additionlLimit = getLimit(ADDITIONAL.additional + '_' + type + '_' + place);
				additionlLimit = additionlLimit === true ? 1 : additionlLimit;
				limit += additionlLimit;

				if (place === PLACES.at_cat) {
					let catLimit = getLimit(ADDITIONAL.additional + '_' + type + '_cat');
					limit += catLimit;
				}

				count += limit;
				limits[place] = limit;
			});

			switch (type) {
				case TYPES.logo: {
					count = 1;
					break;
				}
				case TYPES.goods: {
					count = getLimit(type);
					if (count) {
						count = 50 + (getLimit(ADDITIONAL.additional + '_' + type) * 50);
						let teaser = getLimit('teaser');
						if (teaser) {
							limits.teaser = teaser;
						}
						let teaserOnMain = getLimit('teaser_on_main');
						if (teaserOnMain) {
							limits.teaser_on_main = teaserOnMain;
						}
					}
					break;
				}
				case TYPES.background: {
					let catLimit = getLimit('cat_background');
					let mainLimit = getLimit('main_background');
					count = catLimit + mainLimit;
					if (catLimit) {
						limits[PLACES.at_cat] = catLimit;
					}
					if (mainLimit) {
						limits[PLACES.on_main] = mainLimit;
					}
					break;
				}
				default: {
					break;
				}
			}

			t.count = count;
			t.limits = limits;
			s[type] = t;
		});

		return s;
	},

	renderLimits() {
		const r = [];

		r.push(this.getUrl());
		r.push(this.getDescription());
		r.push(this.getLogo());
		r.push(this.getGoods());
		r.push(this.getBackground());
		r.push(this.getBanner());
		r.push(this.getVerticalbanner());
		r.push(this.getSuperbanner());

		let show = false;
		_.forEach(r, i => {
			if (i) {
				if (_.isArray(i)) {
					_.forEach(i, j => {
						if (j) {
							show = true;
						}
					});
				} else {
					show = true;
				}
			}
		});
		if (show) {
			$('#limitsWarningModal').modal('show');
		} else {
			this.props.success();
		}

		return r;
	},

	getUrl() {
		if ($('[name=\'merchant_url\']').val()) {
			return null;
		}

		return (
			<WarningItem
				key="url"
				label="URL"
				/>
		);
	},

	getDescription() {
		if ($('#about-merchant textarea').val().replace(/<.*?>/gi, '').trim()) {
			return null;
		}

		return (
			<WarningItem
				key="description"
				label="Описание"
				/>
		);
	},

	getLogo() {
		if (!$('.js-merchant-logo')[0]) {
			return (
				<WarningItem
					key={TYPES.logo}
					label={TYPES_NAMES.logo}
					/>
			);
		}

		let atCat = this.state.logo.limits.at_cat;
		if (atCat) {
			const value = $('#admin-logo [name=\'selected_cats\']').val();
			atCat -= value ? value.length : 0;
			if (atCat > 0) {
				return (
					<WarningItem
						key={`${TYPES.logo}${PLACES.at_cat}`}
						label={`${TYPES_NAMES.logo} ${PLACES_NAMES.at_cat}`}
						value={atCat}
						/>
				);
			}
		}
	},

	getGoods() {
		const result = [];
		const {goods} = this.state;
		if (!goods.count) {
			return null;
		}

		const {limits} = goods;
		const $goods = $('#shop-goods-control tbody tr');

		const availableGoods = goods.count - $goods.length;
		if (availableGoods > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.goods}`}
					label={`${TYPES_NAMES.goods}`}
					value={availableGoods}
					/>
			);
		}

		let availableTeaser = limits.teaser - $goods.find('[name=\'teaser\']:checked').length;
		if (availableTeaser > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.goods}teaser`}
					label={`${TYPES_NAMES.goods} ${PLACES_NAMES.teaser}`}
					value={availableTeaser}
					/>
			);
		}

		let availableTeaserOnMain = limits.teaser_on_main - $goods.find('[name=\'teaser_on_main\']:checked').length;
		if (availableTeaserOnMain > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.goods}teaser_on_main`}
					label={`${TYPES_NAMES.goods} ${PLACES_NAMES.teaser_on_main}`}
					value={availableTeaserOnMain}
					/>
			);
		}

		return result;
	},

	getBackground() {
		const result = [];
		const {background} = this.state;
		if (!background.count) {
			return null;
		}

		const {limits} = background;
		const $background = $('#custom-background');

		let availableOnMain = limits[PLACES.on_main];
		let $onMain = $background.find('[data-name=\'on_main\']');
		$onMain.each(function () {
			availableOnMain -= ($(this).find('img').length === 2) ? 1 : 0;
		});
		if (availableOnMain > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.background}on_main`}
					label={`${TYPES_NAMES.background} ${PLACES_NAMES.on_main}`}
					value={availableOnMain}
					/>
			);
		}

		let availableAtCat = limits[PLACES.at_cat];
		let $atCat = $background.find('[data-name=\'at_cat\']');
		$atCat.each(function () {
			availableAtCat -= ($(this).find('img').length === 2) ? 1 : 0;
		});
		if (availableAtCat > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.background}at_cat`}
					label={`${TYPES_NAMES.background} ${PLACES_NAMES.at_cat}`}
					value={availableAtCat}
					/>
			);
		}

		return result;
	},

	getBanner() {
		const result = [];
		const {banner} = this.state;
		if (!banner.count) {
			return null;
		}

		const {limits} = banner;
		const $banner = $('.js-edit-banner-list [data-banner-type=\'banner\']');
		let place = PLACES.on_main;
		let available = limits[place];
		available -= $banner.find(`[name='${place}']:checked`).length;
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.banner}${place}`}
					label={`${TYPES_NAMES.banner} ${PLACES_NAMES[place]}`}
					value={available}
					/>
			);
		}

		place = PLACES.at_cat;
		available = limits[place];
		let $atCat = $banner.find('[name=\'selected_cats\']');
		$atCat.each(function () {
			const value = $(this).val();
			available -= value ? value.length : 0;
		});
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.banner}${place}`}
					label={`${TYPES_NAMES.banner} ${PLACES_NAMES[place]}`}
					value={available}
					/>
			);
		}

		return result;
	},

	getSuperbanner() {
		const result = [];
		const {superbanner} = this.state;
		if (!superbanner.count) {
			return null;
		}

		const {limits} = superbanner;
		const $superbanner = $('.js-edit-banner-list [data-banner-type=\'superbanner\']');
		let place = PLACES.on_main;
		let available = limits[place];
		available -= $superbanner.find(`[name='${place}']:checked`).length;
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.superbanner}${place}`}
					label={`${TYPES_NAMES.superbanner} ${PLACES_NAMES[place]}`}
					value={available}
					/>
			);
		}

		place = PLACES.at_mailing;
		// Only one is allowed
		available = limits[place] ? 1 : 0;
		available -= $superbanner.find(`[name='${place}']:checked`).length;
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.superbanner}${place}`}
					label={`${TYPES_NAMES.superbanner} ${PLACES_NAMES[place]}`}
					value={available}
					/>
			);
		}

		place = PLACES.at_cat;
		available = limits[place];
		let $atCat = $superbanner.find('[name=\'selected_cats\']');
		$atCat.each(function () {
			const value = $(this).val();
			available -= value ? value.length : 0;
		});
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.superbanner}${place}`}
					label={`${TYPES_NAMES.superbanner} ${PLACES_NAMES[place]}`}
					value={available}
					/>
			);
		}

		return result;
	},

	getVerticalbanner() {
		const result = [];
		const {verticalbanner} = this.state;
		if (!verticalbanner.count) {
			return null;
		}

		const {limits} = verticalbanner;
		const $verticalbanner = $('.js-edit-banner-list [data-banner-type=\'verticalbanner\']');
		let available = limits[PLACES.on_main];
		available -= $verticalbanner.find('[name=\'on_main\']:checked').length;
		if (available > 0) {
			result.push(
				<WarningItem
					key={`${TYPES.verticalbanner}on_main`}
					label={`${TYPES_NAMES.verticalbanner} ${PLACES_NAMES.on_main}`}
					value={available}
					/>
			);
		}

		return result;
	},

	render() {
		return (
			<ul className="props merchant-limits-warning">
				{this.renderLimits()}
			</ul>
		);
	}
});

export default MerchantLimitsWarning;

const WarningItem = React.createClass({
	propTypes: {
		label: React.PropTypes.string,
		value: React.PropTypes.number
	},

	render() {
		const {label, value} = this.props;
		const isValueShown = value || value === 0;

		return (
			<li className="props__item">
				<span className="props__label">
					{`${label}${isValueShown ? ':' : ''}`}
				</span>
				{isValueShown ? (
					<span className="props__value">
						{value}
					</span>
				) : null}
			</li>
		);
	}
});
