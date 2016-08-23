/* global React */
/* eslint "react/require-optimization": "off" */

import Carousel from './carousel.jsx';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

class Banner extends React.Component {
	render() {
		const item = this.props.data;
		return (
			<Link
				className="item"
				href={item.url}
				isExternal
				>
				<img className="img-responsive" src={resolveImgPath(item.logo)} alt=""/>
			</Link>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object
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
	data: React.PropTypes.array
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
};

export default Partners;
