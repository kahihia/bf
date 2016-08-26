/* global document */

import React from 'react';
import ReactDOM from 'react-dom';

(function () {
	'use strict';

	const addUser = document.getElementById('add-user');
	if (addUser) {
		let AddUser = require('./admin/administrator/add-user');
		ReactDOM.render(<AddUser/>, addUser);
	}

	const userList = document.getElementById('user-list');
	if (userList) {
		let UserList = require('./admin/administrator/user-list');
		ReactDOM.render(<UserList/>, userList);
	}
})();
