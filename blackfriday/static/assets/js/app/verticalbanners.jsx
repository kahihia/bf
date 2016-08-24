import React from 'react';
import Carousel from './carousel.jsx';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const Banner = React.createClass({
	propTypes: {
		data: React.PropTypes.object
	},

	render() {
		const item = this.props.data;

		return (
			<Link
				href={item.url}
				className="item"
				isExternal
				>
				<img
					className="img-responsive"
					src={resolveImgPath(item.filename)}
					alt=""
					/>
			</Link>
		);
	}
});

const VerticalbannersCarousel = React.createClass({
	propTypes: {
		data: React.PropTypes.array
	},

	render() {
		return (
			<div>
				{this.props.data.map((item, index) => (
					<Banner
						key={index}
						data={item}
						/>
				))}
			</div>
		);
	}
});

const Verticalbanners = React.createClass({
	propTypes: {
		data: React.PropTypes.array,
		pages: React.PropTypes.number,
		perPage: React.PropTypes.number,
		pagesCount: React.PropTypes.number,
		loadPagesCount: React.PropTypes.number,
		isRandom: React.PropTypes.bool,
		isControlsShown: React.PropTypes.bool,
		isPagerShown: React.PropTypes.bool,
		ajaxUrl: React.PropTypes.string,
		ajaxUrlRoot: React.PropTypes.bool,
		speed: React.PropTypes.number,
		onNext: React.PropTypes.func,
		loadMoreText: React.PropTypes.string
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
