import React from 'react';
import arrayShuffle from 'array-shuffle';
import Link from './link.jsx';

const Banner = props => (
	<Link
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

const PartnerList = props => {
	const partners = props.isRandom ? arrayShuffle(props.data) : props.data;

	return (
		<div>
			<div className="title-2">
				<strong>
					{'Партнёры'}
				</strong>
			</div>

			<div className="partners-list">
				<div className="row">
					{partners.map(item => (
						<div
							key={item.id}
							className="col-xs-6 partners-list__item"
							>
							<Banner data={item}/>
						</div>
					))}
				</div>
			</div>
		</div>
	);
};
PartnerList.propTypes = {
	data: React.PropTypes.array,
	isRandom: React.PropTypes.bool
};
// PartnerList.defaultProps = {};

export default PartnerList;
