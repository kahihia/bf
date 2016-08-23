/* global React */
/* eslint "react/require-optimization": "off" */

import Paged from './paged.jsx';
import Link from './link.jsx';
import {resolveImgPath} from './utils.js';

class Banner extends React.Component {
	render() {
		const item = this.props.data;
		return (
			<div className="special-offers__item">
				<Link
					href={item.url}
					className="special-offers__link embed-responsive"
					isExternal
					>
					<img src={resolveImgPath(item.banner_image)} alt="" className="special-offers__banner embed-responsive-item"/>
				</Link>
				{item.merchant_logo ? (
					<a className="special-offers__shop" href={item.merchant_url}>
						<img src={resolveImgPath(item.merchant_logo)} alt="" className="special-offers__logo"/>
						{'К магазину'}
					</a>
				) : null}
			</div>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object
};

class BannerList extends React.Component {
	render() {
		return (
			<div className="banner-list">
				{this.props.data.map((item, index) => (
					<div
						key={index}
						className="banner-list__item"
						>
						<Banner data={item}/>
					</div>
				))}
			</div>
		);
	}
}
BannerList.propTypes = {
	data: React.PropTypes.array
};

class Banners extends React.Component {
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
	data: React.PropTypes.array,
	pages: React.PropTypes.number,
	perPage: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	loadPagesCount: React.PropTypes.number,
	isRandom: React.PropTypes.bool,
	ajaxUrl: React.PropTypes.string,
	ajaxUrlRoot: React.PropTypes.bool,
	speed: React.PropTypes.number,
	onNext: React.PropTypes.func,
	loadMoreText: React.PropTypes.string
};

export default Banners;
