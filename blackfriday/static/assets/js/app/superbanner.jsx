/* eslint react/require-optimization: 0 */

import React from 'react';
import Carousel from './carousel.jsx';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

class Superbanner extends React.Component {
	constructor() {
		super();
		this.state = {
			data: []
		};
		this.handleNext = this.handleNext.bind(this);
	}

	handleNext(data) {
		this.setState({data: data});
	}

	render() {
		const item = this.state.data[0];
		let content = '';
		if (item) {
			const filename = item.fixed ? item.filename : resolveImgPath(item.filename);
			const img = (<img className="embed-responsive-item" src={filename} alt=""/>);
			if (item.url) {
				content = (
					<Link
						href={item.url}
						isExternal
						>
						{img}
					</Link>
				);
			} else {
				content = img;
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

export default Superbanner;
