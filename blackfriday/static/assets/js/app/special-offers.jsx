import React from 'react';
import {resolveImgPath} from './utils.js';
import Link from './link.jsx';

const SpecialOffers = React.createClass({
	propTypes: {
		banners: React.PropTypes.array
	},

	getInitialState() {
		return {};
	},

	render() {
		const {banners} = this.props;

		return (
			<div className="special-offers">
				<div className="row">
					{banners.map((banner, index) => (
						<div
							key={index}
							className="col-sm-6"
							>
							<div className="special-offers__item">
								<Link
									href={banner.url}
									className="special-offers__link embed-responsive"
									isExternal
									>
									<img
										src={resolveImgPath(banner.image)}
										alt=""
										className="special-offers__banner embed-responsive-item"
										/>
								</Link>
							</div>
						</div>
					))}
				</div>
			</div>
		);
	}
});

export default SpecialOffers;
