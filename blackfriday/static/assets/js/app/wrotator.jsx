import React from 'react';
import arrayShuffle from 'array-shuffle';
import Link from './link.jsx';

const Wrotator = props => {
	const backgrounds = arrayShuffle(props.data)[0];

	if (backgrounds.url) {
		return (
			<div className="container wrotator__i">
				<Link
					className="wrotator__left"
					href={backgrounds.url}
					style={{
						backgroundImage: `url(${backgrounds.left})`
					}}
					isExternal
					/>

				<Link
					className="wrotator__right"
					href={backgrounds.url}
					style={{
						backgroundImage: `url(${backgrounds.right})`
					}}
					isExternal
					/>
			</div>
		);
	}

	return (
		<div className="container wrotator__i">
			<span
				className="wrotator__left"
				style={{
					backgroundImage: `url(${backgrounds.left})`
				}}
				/>

			<span
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
