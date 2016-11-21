import React from 'react';
import arrayShuffle from 'array-shuffle';
import Carousel from './carousel.jsx';
import Link from './link.jsx';
import trackers from './trackers.js';

const BANNER_PLACEHOLDER_IMAGE = '/static/images/banner-placeholder.png';

class Banner extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		const {
			data
		} = this.props;

		trackers.logo.clicked(data.id);
		trackers.merchant.clicked(data.id);
	}

	render() {
		const {
			data
		} = this.props;
		let url = data.url;
		let isExternal = false;
		if (data.url === '/merchant/') {
			url = data.merchant_url;
			isExternal = true;
		}

		return (
			<Link
				href={url}
				title={data.name}
				className="party-carousel-content__image-placeholder embed-responsive"
				onClick={this.handleClick}
				isExternal={isExternal}
				>
				<img
					className="party-carousel-content__image embed-responsive-item"
					src={data.image || BANNER_PLACEHOLDER_IMAGE}
					alt=""
					/>
			</Link>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object
};

const BannerPlaceholder = () => (
	<span className="party-carousel-content__image-placeholder embed-responsive">
		<img
			className="party-carousel-content__image embed-responsive-item"
			src={BANNER_PLACEHOLDER_IMAGE}
			alt=""
			/>
	</span>
);
// BannerPlaceholder.propTypes = {};
// BannerPlaceholder.defaultProps = {};

const MerchantsCarousel = props => {
	const {list, perPage, pagesCount} = props;
	const length = list.length;
	let i = length;
	const l = list.map((item, index) => (
		<div
			key={`${index}${item.logo}`}
			className="party-carousel-content__item"
			>
			<Banner data={item}/>
		</div>
	));
	let additional = perPage;
	if (pagesCount === 1 && length <= 4) {
		additional = 4;
	}
	while (i++ < additional) {
		l.push(
			<div
				key={i}
				className="party-carousel-content__item"
				>
				<BannerPlaceholder/>
			</div>
		);
	}
	return (
		<div className="party-carousel-content">
			{l}
		</div>
	);
};
MerchantsCarousel.propTypes = {
	list: React.PropTypes.array,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number
};

export class Merchants extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};

		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({
			data: arrayShuffle(data)
		});
	}

	render() {
		return (
			<div className="party-carousel">
				<Carousel
					onNext={this.handleNext}
					{...this.props}
					>
					<MerchantsCarousel
						list={this.state.data}
						perPage={this.props.perPage}
						pagesCount={this.props.pagesCount}
						/>
				</Carousel>
			</div>
		);
	}
}
Merchants.propTypes = {
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

export class AllMerchants extends React.Component {
	constructor(props) {
		super(props);
		this.state = {
			data: arrayShuffle(props.data || [])
		};
	}

	render() {
		return (
			<div className="all-merchants">
				<div className="row">
					{this.state.data.map(item => (
						<div
							key={`${item.logo}${item.url}`}
							className="col-xs-6 all-merchants__item"
							>
							<Banner data={item}/>
						</div>
					))}
				</div>
			</div>
		);
	}
}
AllMerchants.propTypes = {
	data: React.PropTypes.array
};
