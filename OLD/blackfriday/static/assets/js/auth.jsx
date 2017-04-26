/* global document */

import React from 'react';
import ReactDOM from 'react-dom';

require('css/auth.styl');

(function () {
	'use strict';

	const userRegistration = document.getElementById('user-registration');
	if (userRegistration) {
		let UserRegistration = require('./admin/auth/user-registration');
		ReactDOM.render(<UserRegistration/>, userRegistration);
	}

	const userLogin = document.getElementById('user-login');
	if (userLogin) {
		let UserLogin = require('./admin/auth/user-login');
		ReactDOM.render(<UserLogin/>, userLogin);
	}
})();
