import React from 'react';
import Carousel from './carousel.jsx';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

class Banner extends React.Component {
	render() {
		const {data} = this.props;

		return (
			<Link
				className="item"
				href={data.url}
				isExternal
				>
				<img
					className="img-responsive"
					src={resolveImgPath(data.logo)}
					alt=""
					/>
			</Link>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object.isRequired
};

class PartnersCarousel extends React.Component {
	render() {
		return (
			<div className="row">
				{this.props.data.map((item, index) => (
					<div
						key={index}
						className="col-xs-4 col-sm-2"
						>
						<Banner data={item}/>
					</div>
				))}
			</div>
		);
	}
}
PartnersCarousel.propTypes = {
	data: React.PropTypes.array.isRequired
};

class Partners extends React.Component {
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
		return (
			<div className="partners-carousel">
				<Carousel
					onNext={this.handleNext}
					{...this.props}
					>
					<PartnersCarousel data={this.state.data}/>
				</Carousel>
			</div>
		);
	}
}
Partners.propTypes = {
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
};

export default Partners;
