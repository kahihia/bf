/******/ (function(modules) { // webpackBootstrap
/******/ 	// The module cache
/******/ 	var installedModules = {};

/******/ 	// The require function
/******/ 	function __webpack_require__(moduleId) {

/******/ 		// Check if module is in cache
/******/ 		if(installedModules[moduleId])
/******/ 			return installedModules[moduleId].exports;

/******/ 		// Create a new module (and put it into the cache)
/******/ 		var module = installedModules[moduleId] = {
/******/ 			exports: {},
/******/ 			id: moduleId,
/******/ 			loaded: false
/******/ 		};

/******/ 		// Execute the module function
/******/ 		modules[moduleId].call(module.exports, module, module.exports, __webpack_require__);

/******/ 		// Flag the module as loaded
/******/ 		module.loaded = true;

/******/ 		// Return the exports of the module
/******/ 		return module.exports;
/******/ 	}


/******/ 	// expose the modules object (__webpack_modules__)
/******/ 	__webpack_require__.m = modules;

/******/ 	// expose the module cache
/******/ 	__webpack_require__.c = installedModules;

/******/ 	// __webpack_public_path__
/******/ 	__webpack_require__.p = "/static/build/";

/******/ 	// Load entry module and return exports
/******/ 	return __webpack_require__(0);
/******/ })
/************************************************************************/
/******/ ({

/***/ 0:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	__webpack_require__(331);

	(function () {
		__webpack_require__(332);
		__webpack_require__(333);
		__webpack_require__(334);
		__webpack_require__(335);
	})();

/***/ },

/***/ 207:
/***/ function(module, exports, __webpack_require__) {

	var __WEBPACK_AMD_DEFINE_FACTORY__, __WEBPACK_AMD_DEFINE_RESULT__;'use strict';

	var _typeof = typeof Symbol === "function" && typeof Symbol.iterator === "symbol" ? function (obj) { return typeof obj; } : function (obj) { return obj && typeof Symbol === "function" && obj.constructor === Symbol ? "symbol" : typeof obj; };

	/*!
	 * JavaScript Cookie v2.1.3
	 * https://github.com/js-cookie/js-cookie
	 *
	 * Copyright 2006, 2015 Klaus Hartl & Fagner Brack
	 * Released under the MIT license
	 */
	;(function (factory) {
		var registeredInModuleLoader = false;
		if (true) {
			!(__WEBPACK_AMD_DEFINE_FACTORY__ = (factory), __WEBPACK_AMD_DEFINE_RESULT__ = (typeof __WEBPACK_AMD_DEFINE_FACTORY__ === 'function' ? (__WEBPACK_AMD_DEFINE_FACTORY__.call(exports, __webpack_require__, exports, module)) : __WEBPACK_AMD_DEFINE_FACTORY__), __WEBPACK_AMD_DEFINE_RESULT__ !== undefined && (module.exports = __WEBPACK_AMD_DEFINE_RESULT__));
			registeredInModuleLoader = true;
		}
		if (( false ? 'undefined' : _typeof(exports)) === 'object') {
			module.exports = factory();
			registeredInModuleLoader = true;
		}
		if (!registeredInModuleLoader) {
			var OldCookies = window.Cookies;
			var api = window.Cookies = factory();
			api.noConflict = function () {
				window.Cookies = OldCookies;
				return api;
			};
		}
	})(function () {
		function extend() {
			var i = 0;
			var result = {};
			for (; i < arguments.length; i++) {
				var attributes = arguments[i];
				for (var key in attributes) {
					result[key] = attributes[key];
				}
			}
			return result;
		}

		function init(converter) {
			function api(key, value, attributes) {
				var result;
				if (typeof document === 'undefined') {
					return;
				}

				// Write

				if (arguments.length > 1) {
					attributes = extend({
						path: '/'
					}, api.defaults, attributes);

					if (typeof attributes.expires === 'number') {
						var expires = new Date();
						expires.setMilliseconds(expires.getMilliseconds() + attributes.expires * 864e+5);
						attributes.expires = expires;
					}

					try {
						result = JSON.stringify(value);
						if (/^[\{\[]/.test(result)) {
							value = result;
						}
					} catch (e) {}

					if (!converter.write) {
						value = encodeURIComponent(String(value)).replace(/%(23|24|26|2B|3A|3C|3E|3D|2F|3F|40|5B|5D|5E|60|7B|7D|7C)/g, decodeURIComponent);
					} else {
						value = converter.write(value, key);
					}

					key = encodeURIComponent(String(key));
					key = key.replace(/%(23|24|26|2B|5E|60|7C)/g, decodeURIComponent);
					key = key.replace(/[\(\)]/g, escape);

					return document.cookie = [key, '=', value, attributes.expires ? '; expires=' + attributes.expires.toUTCString() : '', // use expires attribute, max-age is not supported by IE
					attributes.path ? '; path=' + attributes.path : '', attributes.domain ? '; domain=' + attributes.domain : '', attributes.secure ? '; secure' : ''].join('');
				}

				// Read

				if (!key) {
					result = {};
				}

				// To prevent the for loop in the first place assign an empty array
				// in case there are no cookies at all. Also prevents odd result when
				// calling "get()"
				var cookies = document.cookie ? document.cookie.split('; ') : [];
				var rdecode = /(%[0-9A-Z]{2})+/g;
				var i = 0;

				for (; i < cookies.length; i++) {
					var parts = cookies[i].split('=');
					var cookie = parts.slice(1).join('=');

					if (cookie.charAt(0) === '"') {
						cookie = cookie.slice(1, -1);
					}

					try {
						var name = parts[0].replace(rdecode, decodeURIComponent);
						cookie = converter.read ? converter.read(cookie, name) : converter(cookie, name) || cookie.replace(rdecode, decodeURIComponent);

						if (this.json) {
							try {
								cookie = JSON.parse(cookie);
							} catch (e) {}
						}

						if (key === name) {
							result = cookie;
							break;
						}

						if (!key) {
							result[name] = cookie;
						}
					} catch (e) {}
				}

				return result;
			}

			api.set = api;
			api.get = function (key) {
				return api.call(api, key);
			};
			api.getJSON = function () {
				return api.apply({
					json: true
				}, [].slice.call(arguments));
			};
			api.defaults = {};

			api.remove = function (key, attributes) {
				api(key, '', extend(attributes, {
					expires: -1
				}));
			};

			api.withConverter = init;

			return api;
		}

		return init(function () {});
	});

/***/ },

/***/ 331:
/***/ function(module, exports) {

	// removed by extract-text-webpack-plugin

/***/ },

/***/ 332:
/***/ function(module, exports) {

	'use strict';

	/* global $ */

	// Anchors
	$('a[href^="#anchor-"]').on('click', function (e) {
		var $this = $(this);
		var $target = $(this.hash);
		$target = $target.length ? $target : $('[name=' + this.hash.slice(1) + ']');

		if ($target.length) {
			var offset = parseInt($this.data('offset'), 10) || 0;
			var duration = parseInt($this.data('duration'), 10) || 250;

			$('html, body').animate({
				scrollTop: $target.offset().top - offset
			}, duration);

			e.preventDefault();
		}
	});

/***/ },

/***/ 333:
/***/ function(module, exports) {

	'use strict';

	/* global $ */

	// Включаем карусель партнеров когда их больше 1 страницы
	if ($('.bxslider-one > div').length > 1) {
		$('.bxslider-one').bxSlider({
			minSlides: 1,
			maxSlides: 1,
			auto: true
		});
	}

	$('.bxslider-multi').bxSlider({
		slideWidth: 182,
		minSlides: 6,
		maxSlides: 6,
		moveSlides: 1,
		auto: true,
		pager: false
	});

	$('.js-about-section__carousel').bxSlider({
		minSlides: 1,
		maxSlides: 1,
		auto: true,
		pager: false
		});

/***/ },

/***/ 334:
/***/ function(module, exports) {

	'use strict';

	/* global $ */

	var ts = new Date(2016, 10, 24, 0, 0);

	if (new Date() > ts) {
		// The new year is here! Count towards something else.
		// Notice the *1000 at the end - time must be in milliseconds
		ts = new Date().getTime() + 10 * 24 * 60 * 60 * 1000;
	}

	var $d = $('#countdown-d');
	var $h = $('#countdown-h');
	var $m = $('#countdown-m');
	var $s = $('#countdown-s');

	$('#countdown').countdown({
		timestamp: ts,
		callback: function callback(d, h, m, s) {
			$d.text(declOfNum(d, ['день', 'дня', 'дней']));
			$h.text(declOfNum(h, ['час', 'часа', 'часов']));
			$m.text(declOfNum(m, ['минута', 'минуты', 'минут']));
			$s.text(declOfNum(s, ['секунда', 'секунды', 'секунд']));

			if (d >= 100) {
				$d.css('width', '27%');
				$h.css('width', '16%');
				$m.css('width', '16%');
				$s.css('width', '16%');
			} else {
				$d.css('width', '19%');
				$h.css('width', '19%');
				$m.css('width', '19%');
				$s.css('width', '19%');
			}
		}
	});

	/* Обратный отсчет */
	function declOfNum(number, titles) {
		var cases = [2, 0, 1, 1, 1, 2];

		return titles[number % 100 > 4 && number % 100 < 20 ? 2 : cases[number % 10 < 5 ? number % 10 : 5]];
	}

/***/ },

/***/ 335:
/***/ function(module, exports, __webpack_require__) {

	'use strict';

	var _jsCookie = __webpack_require__(207);

	var _jsCookie2 = _interopRequireDefault(_jsCookie);

	function _interopRequireDefault(obj) { return obj && obj.__esModule ? obj : { 'default': obj }; }

	var csrftoken = _jsCookie2['default'].get('csrftoken'); /* global $ toastr */

	$.ajaxSetup({
		headers: {
			'X-CSRFToken': csrftoken
		}
	});

	$('form').ajaxForm({
		clearForm: true,
		success: showResponse
	});

	function showResponse() {
		toastr.success('Заявка успешно отправлена');
		$('.modal.in').modal('hide');
	}

/***/ }

/******/ });
//# sourceMappingURL=landing-a3b004a1be117fa39b9c.js.map