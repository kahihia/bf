/* global document */

import React from 'react';
import ReactDOM from 'react-dom';
import {ModerationList} from './admin/advertisers/moderation-list.jsx';

(function () {
	'use strict';
	const block = document.getElementById('admin-moderation');
	ReactDOM.render(<ModerationList/>, block);
})();
