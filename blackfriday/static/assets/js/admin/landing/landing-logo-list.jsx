import React from 'react';
import {Sortable as sortable} from 'react-sortable';

const LandingLogoListItem = React.createClass({
	propTypes: {
		children: React.PropTypes.any
	},

	getDefaultProps() {
		return {};
	},

	render() {
		return (
			<div
				{...this.props}
				className="landing-logo-list__item"
				>
				{this.props.children}
			</div>
		);
	}
});

const SortableLandingLogoListItem = sortable(LandingLogoListItem);

const LandingLogoList = React.createClass({
	propTypes: {
		logos: React.PropTypes.array
	},

	getDefaultProps() {
		return {};
	},

	getInitialState() {
		return {
			draggingIndex: null,
			logos: []
		};
	},

	componentWillReceiveProps(props) {
		const {logos} = props;
		this.setState({logos});
	},

	updateState(data) {
		this.setState(data);
	},

	render() {
		const {draggingIndex, logos} = this.state;

		return (
			<div className="landing-logo-list">
				{logos.map((item, index) => {
					return (
						<SortableLandingLogoListItem
							key={index}
							updateState={this.updateState}
							items={logos}
							draggingIndex={draggingIndex}
							sortId={index}
							outline="column"
							>
							<a
								className="landing-logo-list__link"
								href={item.url}
								target="_blank"
								rel="noopener noreferrer"
								>
								<img
									className="landing-logo-list__logo"
									src={item.image}
									alt=""
									/>
							</a>
						</SortableLandingLogoListItem>
					);
				})}
			</div>
		);
	}
});

export default LandingLogoList;
