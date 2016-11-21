import React from 'react';
import arrayShuffle from 'array-shuffle';
import Link from './link.jsx';
import trackers from './trackers.js';

class BackgroundsLinked extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		trackers.banner.clicked(this.props.data.id);
	}

	render() {
		const {
			data
		} = this.props;

		return (
			<div className="container wrotator__i">
				<Link
					className="wrotator__left"
					href={data.url}
					style={{
						backgroundImage: `url(${data.left})`
					}}
					onClick={this.handleClick}
					isExternal
					/>

				<Link
					className="wrotator__right"
					href={data.url}
					style={{
						backgroundImage: `url(${data.right})`
					}}
					onClick={this.handleClick}
					isExternal
					/>
			</div>
		);
	}
}
BackgroundsLinked.propTypes = {
	data: React.PropTypes.object
};
// BackgroundsLinked.defaultProps = {};

const Wrotator = props => {
	const backgrounds = arrayShuffle(props.data)[0];

	if (backgrounds.url) {
		return (<BackgroundsLinked data={backgrounds}/>);
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
