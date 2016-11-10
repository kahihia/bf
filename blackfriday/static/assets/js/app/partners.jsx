import React from 'react';
import Carousel from './carousel.jsx';
import Link from './link.jsx';

const Banner = props => (
	<Link
		className="item"
		href={props.data.url}
		title={props.data.name}
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
	data: React.PropTypes.object.isRequired
};
// Banner.defaultProps = {};

const PartnersCarousel = props => (
	<div className="row">
		{props.data.map(item => (
			<div
				key={item.id}
				className="col-xs-4 col-sm-2"
				>
				<Banner data={item}/>
			</div>
		))}
	</div>
);
PartnersCarousel.propTypes = {
	data: React.PropTypes.array.isRequired
};
// PartnersCarousel.defaultProps = {};

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
			<div>
				<div className="title-2">
					<strong>
						{'Партнёры'}
					</strong>
				</div>

				<div className="partners-carousel">
					<Carousel
						onNext={this.handleNext}
						{...this.props}
						>
						<PartnersCarousel data={this.state.data}/>
					</Carousel>
				</div>
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
