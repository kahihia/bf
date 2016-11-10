import React from 'react';
import arrayShuffle from 'array-shuffle';

const Wrotator = props => {
	const backgrounds = arrayShuffle(props.data)[0];

	return (
		<div className="container wrotator__i">
			<div
				className="wrotator__left"
				style={{
					backgroundImage: `url(${backgrounds.left})`
				}}
				/>

			<div
				className="wrotator__right"
				style={{
					backgroundImage: `url(${backgrounds.right})`
				}}
				/>
		</div>
	);
};
Wrotator.propTypes = {
	data: React.PropTypes.array
};
Wrotator.defaultProps = {
	data: []
};

export default Wrotator;
