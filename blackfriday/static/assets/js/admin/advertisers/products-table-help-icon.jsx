import React from 'react';
import Icon from '../components/icon.jsx';
import Popover from '../components/popover.jsx';

const HELP_IMAGE_DIR = '/static/images/admin/';
const HELP_IMAGE_NAME = 'products-table-help-icon';
const HELP = {
	name: {
		text: 'Укажите название товара'
	},
	discount: {
		image: `${HELP_IMAGE_DIR}${HELP_IMAGE_NAME}_discount.png`
	},
	price: {
		image: `${HELP_IMAGE_DIR}${HELP_IMAGE_NAME}_oldprice.png`
	},
	oldprice: {
		image: `${HELP_IMAGE_DIR}${HELP_IMAGE_NAME}_oldprice.png`
	},
	startprice: {
		image: `${HELP_IMAGE_DIR}${HELP_IMAGE_NAME}_startprice.png`
	},
	country: {
		text: 'Укажите страну производителя товара'
	},
	brand: {
		text: 'Укажите производителя товара'
	},
	category: {
		text: 'Выберите категория товара'
	},
	image: {
		text: 'Укажите ссылку на изображение товара'
	}
};

const ProductsTableHelpIcon = props => {
	let isHTML = false;
	const help = HELP[props.name];
	let content = help.text;

	if (help.image) {
		isHTML = true;
		content = `
			<img src="${help.image}" alt=""/>
			${help.text ? `<p>${help.text}</p>` : ''}
		`;
	}

	return (
		<Popover
			content={content}
			placement="top"
			html={isHTML}
			>
			<Icon name="products-table-help"/>
		</Popover>
	);
};
ProductsTableHelpIcon.propTypes = {
	name: React.PropTypes.string.isRequired
};
// ProductsTableHelpIcon.defaultProps = {};

export default ProductsTableHelpIcon;
