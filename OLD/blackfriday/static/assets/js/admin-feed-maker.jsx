/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import FeedMaker from './admin/catalog/feed-maker.jsx';

(function () {
	'use strict';
	const block = document.getElementById('admin-feed-maker');
	ReactDOM.render(<FeedMaker/>, block);
})();
