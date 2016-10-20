/* global $ */
var LANG = $('html').attr('lang');

const MESSAGES_RU = {
	subscribeSuccess: 'Заявка успешно отправлена',
	subscribeError: 'Не удалось отправить заявку',
	subscribeExists: 'Заявка с таким адресом электронной почты уже в работе'
};

const MESSAGES_CN = {
	subscribeSuccess: '预订好了',
	subscribeError: '对不起，您的申请书无法投递',
	subscribeExists: '电子邮件地址已经被占用'
};

const MESSAGES = LANG === 'zh-CN' ? MESSAGES_CN : MESSAGES_RU;

export default MESSAGES;
