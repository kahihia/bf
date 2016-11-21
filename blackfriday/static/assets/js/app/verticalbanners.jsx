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
		trackers.banner.clicked(this.props.data.id);
	}

	render() {
		const {
			data
		} = this.props;

		return (
			<Link
				href={data.url}
				className="item"
				onClick={this.handleClick}
				isExternal
				>
				<img
					className="img-responsive"
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
