/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import {PromoMaker} from './admin/promo/promo-maker.jsx';

(function () {
	'use strict';
	const block = document.getElementById('admin-promo-maker');
	ReactDOM.render(<PromoMaker/>, block);
})();
