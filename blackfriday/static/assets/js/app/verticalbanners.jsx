import React from 'react';
import Carousel from './carousel.jsx';
import Link from './link.jsx';

const Banner = props => (
	<Link
		href={props.data.url}
		className="item"
		isExternal
		>
		<img
			className="img-responsive"
			src={props.data.image}
			alt=""
			/>
	</Link>
);
Banner.propTypes = {
	data: React.PropTypes.object
};
// Banner.defaultProps = {};

const VerticalbannersCarousel = props => (
	<div>
		{props.data.map(item => (
			<Banner
				key={item.id}
				data={item}
				/>
		))}
	</div>
);
VerticalbannersCarousel.propTypes = {
	data: React.PropTypes.array
};
// VerticalbannersCarousel.defaultProps = {};

const Verticalbanners = React.createClass({
	propTypes: {
		ajaxUrl: React.PropTypes.string,
		ajaxUrlRoot: React.PropTypes.bool,
		data: React.PropTypes.array,
		isControlsShown: React.PropTypes.bool,
		isPagerShown: React.PropTypes.bool,
		isRandom: React.PropTypes.bool,
		loadMoreText: React.PropTypes.string,
		loadPagesCount: React.PropTypes.number,
		onNext: React.PropTypes.func,
		pages: React.PropTypes.number,
		pagesCount: React.PropTypes.number,
		perPage: React.PropTypes.number,
		speed: React.PropTypes.number
	},

	getInitialState() {
		return {
			data: []
		};
	},

	handleNext(data) {
		this.setState({data});
	},

	render() {
		return (
			<div className="verticalbanners-carousel">
				<Carousel
					onNext={this.handleNext}
					{...this.props}
					>
					<VerticalbannersCarousel data={this.state.data}/>
				</Carousel>
			</div>
		);
	}
});

export default Verticalbanners;
