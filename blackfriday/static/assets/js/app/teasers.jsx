import React from 'react';
import Slider from 'react-slick';
import ShortProduct from './short-product.jsx';
import {getRandomItems} from './utils.js';
import trackers from './trackers.js';

const settings = {
	infinite: false,
	draggable: false,
	vertical: true,
	swipe: false,
	speed: 500,
	slidesToShow: 3,
	slidesToScroll: 3,
	responsive: [
		{
			breakpoint: 991,
			settings: {
				vertical: false,
				slidesToShow: 3,
				slidesToScroll: 3
			}
		},
		{
			breakpoint: 608,
			settings: {
				slidesToShow: 2,
				slidesToScroll: 2
			}
		},
		{
			breakpoint: 440,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	]
};

class Teasers extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(id) {
		trackers.teaser.clicked(id);
	}

	render() {
		const {
			data,
			showCategory,
			showMerchant
		} = this.props;

		const products = getRandomItems(data, 3)[0];

		return (
			<Slider {...settings}>
				{products.map(item => (
					<ShortProduct
						key={item.id}
						data={item}
						showCategory={showCategory}
						showMerchant={showMerchant}
						onClick={this.handleClick}
						/>
				))}
			</Slider>
		);
	}
}
Teasers.propTypes = {
	data: React.PropTypes.array,
	showCategory: React.PropTypes.bool,
	showMerchant: React.PropTypes.bool
};
Teasers.defaultProps = {
	data: []
};

export default Teasers;
