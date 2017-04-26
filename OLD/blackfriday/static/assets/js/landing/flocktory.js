/* global $ localStorage */

// Floctory
// Добавляет блок с информацией для работы с Floctory
// Если информация неполная или отсутствует, то блок уничтожается
var CreateFloctory = function () {
	this.name = null;
	this.email = null;
	this._$block = null;
	this._$blockMgm = null;

	if (this._load()) {
		this._build();
	}
};

CreateFloctory.prototype = {
	update: function (name, email) {
		if (!this._save(name, email)) {
			return;
		}

		this._build();
	},

	renderMgm: function () {
		this._buildMgm();
	},

	_build: function () {
		let bl = '<div class="i-flocktory"';
		if (this.name) {
			bl += ` data-fl-user-name="${this.name}"`;
		}
		if (this.email) {
			bl += ` data-fl-user-email="${this.email}"`;
		}
		bl += '></div>';
		this._$block = $(bl).appendTo('body');
	},

	_buildMgm: function () {
		if (this._$blockMgm) {
			return;
		}

		this._$blockMgm = $('<div class="i-flocktory" data-fl-action="fire-event" data-fl-event="mgm"></div>').appendTo('body');
	},

	_save: function (name, email) {
		this._reset();

		if (!name && !email) {
			return false;
		}

		name = name === null ? '' : String(name).trim();
		email = email === null ? '' : String(email).trim();

		this.name = name;
		this.email = email;

		localStorage.setItem('userdata', JSON.stringify({name, email}));

		return true;
	},

	_load: function () {
		var data = localStorage.getItem('userdata');

		if (!data) {
			return false;
		}

		data = JSON.parse(data);
		this.name = data.name;
		this.email = data.email;

		return true;
	},

	_reset: function () {
		if (this._$block) {
			this._$block.remove();
		}

		this._$block = null;
		this.name = null;
		this.email = null;
	}
};

export default new CreateFloctory();
