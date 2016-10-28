/* eslint react/require-optimization: 0 */

import React from 'react';
import Paged from './paged.jsx';
import Link from './link.jsx';
import {resolveImgPath} from './utils.js';

class Banner extends React.Component {
	render() {
		const {data} = this.props;

		return (
			<div className="special-offers__item">
				<Link
					href={data.url}
					className="special-offers__link embed-responsive"
					isExternal
					>
					<img
						src={resolveImgPath(data.banner_image)}
						alt=""
						className="special-offers__banner embed-responsive-item"
						/>
				</Link>

				{data.merchant_logo ? (
					<a
						className="special-offers__shop"
						href={data.merchant_url}
						>
						<img
							src={resolveImgPath(data.merchant_logo)}
							alt=""
							className="special-offers__logo"
							/>

						{'К магазину'}
					</a>
				) : null}
			</div>
		);
	}
}
Banner.propTypes = {
	data: React.PropTypes.object.isRequired
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
	pages: React.PropTypes.number,
	pagesCount: React.PropTypes.number,
	perPage: React.PropTypes.number,
	speed: React.PropTypes.number
};

export default Banners;
