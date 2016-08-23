/* global React */

import arrayShuffle from 'array-shuffle';

import {resolveImgPath} from './utils.js';

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
						backgroundImage: `url(${resolveImgPath(backgrounds.left)})`
					}}
					/>
				<div
					className="wrotator__right"
					style={{
						backgroundImage: `url(${resolveImgPath(backgrounds.right)})`
					}}
					/>
			</div>
		);
	}
});

export default Wrotator;
