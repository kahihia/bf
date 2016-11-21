/* global window */

import React from 'react';
import Slider from 'react-slick';
import Link from './link.jsx';
import trackers from './trackers.js';

class Banner extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	componentDidMount() {
		trackers.banner.shown(this.props.data.id);
	}

	handleClick() {
		const {
			data
		} = this.props;

		trackers.banner.clicked(data.id);

		if (data.merchant) {
			trackers.merchant.clicked(data.merchant.id);
		}
	}

	render() {
		const {
			data
		} = this.props;

		return (
			<Link
				href={data.url}
				className="special-offers__link embed-responsive"
				onClick={this.handleClick}
				isExternal
				>
				<img
					className="special-offers__banner embed-responsive-item"
					src={data.image}
					alt=""
					/>
			</Link>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object
};
// Banner.defaultProps = {};

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
			<Banner data={banner}/>
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
