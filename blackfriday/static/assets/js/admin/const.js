/* global window */

import Cookie from 'js-cookie';

const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

export const REGEXP = {
	password: /^[A-Za-z0-9]{8,}$/,
	email: /\S@\S+\.\S{2,}/
};

export const USER_ROLE = {
	advertiser: 'Рекламодатель',
	manager: 'Менеджер',
	admin: 'Администратор'
};

export const HEAD_BASIS = {
	0: 'На основании устава',
	1: 'На основании доверенности'
};

export const HELP_TEXT = {
	password: 'Не менее 8 симв., латинские буквы или цифры.'
};

export const TOKEN = {
	recaptcha: ENV.tokens && ENV.tokens.recaptcha,
	csrftoken: Cookie.get('csrftoken')
};
