import React from 'react';
import ShortProduct from './short-product.jsx';
import Slider from 'react-slick';

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

const Teasers = props => (
	<Slider {...settings}>
		{props.data.map(item => (
			<ShortProduct
				key={item.id}
				data={item}
				showCategory={props.showCategory}
				/>
		))}
	</Slider>
);
Teasers.propTypes = {
	data: React.PropTypes.array,
	showCategory: React.PropTypes.bool,
	showMerchant: React.PropTypes.bool
};
Teasers.defaultProps = {
	data: []
};

export default Teasers;
