import React from 'react';
import Paged from './paged.jsx';
import Link from './link.jsx';

const Banner = props => (
	<div className="special-offers__item">
		<Link
			href={props.data.url}
			className="special-offers__link embed-responsive"
			isExternal
			>
			<img
				src={props.data.image}
				alt=""
				className="special-offers__banner embed-responsive-item"
				/>
		</Link>

		{props.data.merchant ? (
			<a
				className="special-offers__shop"
				href={props.data.merchant.url}
				>
				<img
					src={props.data.merchant.image}
					alt=""
					className="special-offers__logo"
					/>

				{'К магазину'}
			</a>
		) : null}
	</div>
);
Banner.propTypes = {
	data: React.PropTypes.object.isRequired
};

const BannerList = props => (
	<div className="banner-list">
		{props.data.map(item => (
			<div
				key={item.id}
				className="banner-list__item"
				>
				<Banner data={item}/>
			</div>
		))}
	</div>
);
BannerList.propTypes = {
	data: React.PropTypes.array.isRequired
};

class Banners extends React.Component {
	constructor(props) {
		super(props);
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
			<Paged
				{...this.props}
				loadMoreText={'Показать больше акций'}
				onNext={this.handleNext}
				>
				<BannerList data={this.state.data}/>
			</Paged>
		);
	}
}
Banners.propTypes = {
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	data: React.PropTypes.array,
	isRandom: React.PropTypes.bool,
	loadMoreText: React.PropTypes.string,
	loadPagesCount: React.PropTypes.number,
	onNext: React.PropTypes.func,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	speed: React.PropTypes.number
};

export default Banners;
