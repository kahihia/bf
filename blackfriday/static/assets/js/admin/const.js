/* global window */

import Cookie from 'js-cookie';

const ENV = JSON.parse(JSON.stringify(window.ENV || {}));

export const REGEXP = {
	password: /^[A-Za-z0-9]{8,}$/,
	email: /\S@\S+\.\S{2,}/
};

export const USER_ROLE = {
	advertiser: 'Рекламодатель',
	manager: 'Контент-менеджер',
	operator: 'Менеджер',
	admin: 'Администратор'
};

export const HEAD_BASIS = {
	0: 'На основании устава',
	1: 'На основании доверенности'
};

export const PAYMENT_STATUS = {
	0: 'Не оплачен',
	1: 'Оплачен',
	2: 'Отменён'
};

export const MODERATION_STATUS = {
	0: 'Не модерировался',
	1: 'Ожидает модерации',
	2: 'Подтверждён',
	3: 'Отклонён'
};

export const HELP_TEXT = {
	password: 'Не менее 8 симв., латинские буквы или цифры.'
};

export const TOKEN = {
	recaptcha: ENV.tokens && ENV.tokens.recaptcha,
	csrftoken: Cookie.get('csrftoken')
};

export const SITE_URL = ENV.siteUrl;
