/* global window */

import React from 'react';
import Slider from 'react-slick';
import Link from './link.jsx';

const settings = {
	infinite: false,
	draggable: false,
	swipe: false,
	speed: 500,
	slidesToShow: 2,
	slidesToScroll: 2,
	dots: true,
	responsive: [
		{
			breakpoint: 650,
			settings: {
				slidesToShow: 1,
				slidesToScroll: 1
			}
		}
	]
};

const renderSpecialOffersList = data => data.map(banner => (
	<div
		key={banner.id}
		className="col-sm-6"
		>
		<div className="special-offers__item">
			<Link
				href={banner.url}
				className="special-offers__link embed-responsive"
				isExternal
				>
				<img
					src={banner.image}
					alt=""
					className="special-offers__banner embed-responsive-item"
					/>
			</Link>
		</div>
	</div>
));

const SpecialOffers = props => (
	<div className="special-offers">
		<div className="row">
			{window.innerWidth > 949 ? renderSpecialOffersList(props.data) : (
				<Slider {...settings}>
					{renderSpecialOffersList(props.data)}
				</Slider>
			)}
		</div>
	</div>
);
SpecialOffers.propTypes = {
	data: React.PropTypes.array
};
// SpecialOffers.defaultProps = {};

export default SpecialOffers;
