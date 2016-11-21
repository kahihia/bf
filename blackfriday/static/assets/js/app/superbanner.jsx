import React from 'react';
import Carousel from './carousel.jsx';
import Link from './link.jsx';
import trackers from './trackers.js';

class Banner extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
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
			children,
			data
		} = this.props;

		return (
			<Link
				href={data.url}
				onClick={this.handleClick}
				isExternal
				>
				{children}
			</Link>
		);
	}
}
Banner.propTypes = {
	children: React.PropTypes.any,
	data: React.PropTypes.object
};
// Banner.defaultProps = {};

class Superbanner extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};

		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({data});
	}

	render() {
		const item = this.state.data[0];
		let content = '';
		if (item) {
			const img = (
				<img
					className="embed-responsive-item"
					src={item.image}
					alt=""
					/>
			);

			if (item.url) {
				content = (
					<Banner data={item}>
						{img}
					</Banner>
				);
			} else {
				content = (
					<span>
						{img}
					</span>
				);
			}
		}

		return (
			<div className="super-banner-carousel">
				<Carousel
					onNext={this.handleNext}
					{...this.props}
					>
					<div className="super-banner-carousel-content">
						<div className="super-banner-carousel-content__item embed-responsive">
							{content}
						</div>
					</div>
				</Carousel>
			</div>
		);
	}
}
Superbanner.propTypes = {
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	data: React.PropTypes.array,
	isControlsShown: React.PropTypes.bool,
	isPagerShown: React.PropTypes.bool,
	isRandom: React.PropTypes.bool,
	loadMoreText: React.PropTypes.string,
	loadPagesCount: React.PropTypes.number,
	onNext: React.PropTypes.func,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	speed: React.PropTypes.number
};

export default Superbanner;
