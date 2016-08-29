import Cookie from 'js-cookie';

export const REGEXP = {
	password: /^\S{8,}$/,
	email: /\S@\S+\.\S{2,}/
};

export const USER_ROLE = {
	advertiser: 'Рекламодатель',
	manager: 'Менеджер',
	admin: 'Администратор'
};

export const HELP_TEXT = {
	password: 'Не менее 8 симв., латинские буквы или цифры.'
};

export const TOKEN = {
	recaptcha: '6LeECx8TAAAAAHBhJCluCug9AbZ7-z0cbXJZyNf9',
	csrftoken: Cookie.get('csrftoken')
};
