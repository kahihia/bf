/* eslint react/jsx-no-bind: 0 */

import React from 'react';
import classNames from 'classnames';

const Tabs = React.createClass({
	displayName: 'Tabs',

	propTypes: {
		className: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.string,
			React.PropTypes.object
		]),
		tabActive: React.PropTypes.number,
		children: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.element
		]).isRequired
	},

	getDefaultProps() {
		return {
			tabActive: 1
		};
	},

	getInitialState() {
		return {
			tabActive: this.props.tabActive,
			mountedPanels: [this.props.tabActive]
		};
	},

	componentWillReceiveProps(newProps) {
		if (newProps.tabActive && newProps.tabActive !== this.props.tabActive) {
			this.setState(previousState => {
				if (previousState.mountedPanels.indexOf(newProps.tabActive) === -1) {
					previousState.mountedPanels.push(newProps.tabActive);
				}
				previousState.tabActive = newProps.tabActive;
				return previousState;
			});
		}
	},

	render() {
		const className = classNames('tabs', this.props.className);

		return (
			<div className={className}>
				{this._getMenuItems()}
				{this._getPanelItems()}
			</div>
		);
	},

	setActive(index, e) {
		e.preventDefault();
		this.setState(previousState => {
			if (previousState.mountedPanels.indexOf(index) === -1) {
				previousState.mountedPanels.push(index);
			}
			previousState.tabActive = index;
			return previousState;
		});
	},

	_getMenuItems() {
		if (!this.props.children) {
			throw new Error('Tabs must contain at least one Tabs.Panel');
		}

		if (!Array.isArray(this.props.children)) {
			this.props.children = [this.props.children];
		}

		const $menuItems = this.props.children
			.map($panel => typeof $panel === 'function' ? $panel() : $panel)
			.filter($panel => $panel)
			.map(($panel, index) => {
				const title = $panel.props.title;
				const classes = classNames(
					'tabs-menu-item',
					this.state.tabActive === (index + 1) && 'is-active'
				);

				return (
					<li
						key={index}
						className={classes}
						>
						<a onClick={this.setActive.bind(this, index + 1)}>
							{title}
						</a>
					</li>
				);
			});

		return (
			<nav className="tabs-navigation">
				<ul className="tabs-menu">
					{$menuItems}
				</ul>
			</nav>
		);
	},

	_getPanelItems() {
		const tabActive = this.state.tabActive - 1;

		return this.props.children.map(($panel, index) => {
			const classes = classNames(
				'tab-panel',
				tabActive === index && 'is-active'
			);

			const isMounted = (tabActive === index) || this.state.mountedPanels.indexOf(index + 1) > -1;

			return (
				<article
					key={index}
					className={classes}
					>
					{isMounted ? (
						$panel
					) : null}
				</article>
			);
		});
	}
});

Tabs.Panel = React.createClass({
	displayName: 'Panel',

	propTypes: {
		title: React.PropTypes.oneOfType([
			React.PropTypes.string,
			React.PropTypes.node
		]).isRequired,
		children: React.PropTypes.oneOfType([
			React.PropTypes.array,
			React.PropTypes.element
		]).isRequired
	},

	render() {
		return (
			<div>
				{this.props.children}
			</div>
		);
	}
});

export default Tabs;
