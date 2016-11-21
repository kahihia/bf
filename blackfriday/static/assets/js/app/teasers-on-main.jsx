import React from 'react';
import ShortProduct from './short-product.jsx';
import Slider from 'react-slick';

const settings = {
	infinite: false,
	draggable: false,
	swipe: false,
	speed: 500,
	slidesToShow: 5,
	slidesToScroll: 5,
	responsive: [
		{
			breakpoint: 991,
			settings: {
				slidesToShow: 4,
				slidesToScroll: 4
			}
		},
		{
			breakpoint: 767,
			settings: {
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

class TeasersOnMain extends React.Component {
	render() {
		const {
			data,
			footer,
			showCategory,
			showMerchant
		} = this.props;

		return (
			<div className="main-teaser">
				<div className="main-teaser__body">
					<div className="product-list">
						<Slider {...settings}>
							{data.map(item => (
								<div
									key={item.id}
									className="product-list__item"
									>
									<ShortProduct
										data={item}
										showCategory={showCategory}
										showMerchant={showMerchant}
										isTeaser
										/>
								</div>
							))}
						</Slider>
					</div>
				</div>

				{footer}
			</div>
		);
	}
}
TeasersOnMain.propTypes = {
	data: React.PropTypes.array,
	footer: React.PropTypes.any,
	showCategory: React.PropTypes.bool,
	showMerchant: React.PropTypes.bool
};
TeasersOnMain.defaultProps = {
	data: []
};

export default TeasersOnMain;
