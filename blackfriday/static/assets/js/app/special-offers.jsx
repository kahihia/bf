import React from 'react';
import Link from './link.jsx';
import StickerSupernova from './sticker-supernova.jsx';

const SpecialOffers = props => (
	<div className="special-offers">
		<div className="row">
			{props.banners.map(banner => (
				<div
					key={banner.id}
					className="col-sm-6"
					>
					<div className="special-offers__item">
						<Link
							href={banner.url}
							className="special-offers__link embed-responsive"
							isExternal
							>
							<img
								src={banner.image}
								alt=""
								className="special-offers__banner embed-responsive-item"
								/>
						</Link>

						{banner.isSupernova ? (
							<StickerSupernova size="lg"/>
						) : null}
					</div>
				</div>
			))}
		</div>
	</div>
);
SpecialOffers.propTypes = {
	banners: React.PropTypes.array
};
// SpecialOffers.defaultProps = {};

export default SpecialOffers;
