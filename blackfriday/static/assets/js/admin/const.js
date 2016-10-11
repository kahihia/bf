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

export const APPLICATION_STATUS = {
	0: 'Новая',
	10: 'В работе',
	20: 'Участвует',
	30: 'Отказ'
};

export const BANNER_TYPE = {
	0: {
		name: 'Супербаннер',
		width: 900,
		height: 275
	},
	10: {
		name: 'Акционный баннер',
		width: 435,
		height: 250
	},
	20: {
		name: 'Вертикальный баннер',
		width: 240,
		height: 400
	},
	30: {
		name: 'Фон слева',
		width: 500,
		height: 2000
	},
	40: {
		name: 'Фон справа',
		width: 500,
		height: 2000
	}
};

export const HELP_TEXT = {
	password: 'Не менее 8 симв., латинские буквы или цифры.'
};

export const TOKEN = {
	recaptcha: ENV.tokens && ENV.tokens.recaptcha,
	csrftoken: Cookie.get('csrftoken')
};

export const SITE_URL = ENV.siteUrl;

export const SORT_TYPES = {
	ASC: 'ASC',
	DESC: 'DESC'
};
