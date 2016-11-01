import React from 'react';
import arrayShuffle from 'array-shuffle';

const Wrotator = React.createClass({
	propTypes: {
		data: React.PropTypes.array
	},

	getDefaultProps() {
		return {
			data: []
		};
	},

	render() {
		const backgrounds = arrayShuffle(this.props.data)[0];

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
	}
});

export default Wrotator;
