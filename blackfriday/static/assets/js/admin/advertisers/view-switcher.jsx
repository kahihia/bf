/* eslint react/require-optimization: 0 */

import React from 'react';
import classNames from 'classnames';
import Glyphicon from '../components/glyphicon.jsx';

const VIEW = {
	list: 'Список',
	grid: 'Плитка'
};

const VIEW_ICONS = {
	list: 'th-list',
	grid: 'th-large'
};

class ViewSwitcher extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick(view) {
		this.props.onClick(view);
	}

	render() {
		const {view} = this.props;

		return (
			<span className="view-switcher">
				<ViewSwitcherButton
					name="grid"
					isActive={view === 'grid'}
					onClick={this.handleClick}
					/>

				<ViewSwitcherButton
					name="list"
					isActive={view === 'list'}
					onClick={this.handleClick}
					/>
			</span>
		);
	}
}
ViewSwitcher.propTypes = {
	view: React.PropTypes.oneOf(['list', 'grid']),
	onClick: React.PropTypes.func.isRequired
};
ViewSwitcher.defaultProps = {
};

export default ViewSwitcher;

class ViewSwitcherButton extends React.Component {
	constructor(props) {
		super(props);

		this.handleClick = this.handleClick.bind(this);
	}

	handleClick() {
		this.props.onClick(this.props.name);
	}

	render() {
		const {name, isActive} = this.props;

		return (
			<button
				className={classNames('btn btn-default', {active: isActive})}
				onClick={this.handleClick}
				type="button"
				>
				<Glyphicon name={VIEW_ICONS[name]}/>
				{' '}
				{VIEW[name]}
			</button>
		);
	}
}
ViewSwitcherButton.propTypes = {
	name: React.PropTypes.string,
	isActive: React.PropTypes.bool,
	onClick: React.PropTypes.func.isRequired
};
ViewSwitcherButton.defaultProps = {
};
