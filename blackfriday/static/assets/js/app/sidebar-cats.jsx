import React from 'react';
import Dropdown, {DropdownTrigger, DropdownContent} from 'react-simple-dropdown';
import SimpleMenu from './simple-menu.jsx';
import {categoriesSorting} from './utils.js';

const SidebarCats = React.createClass({
	propTypes: {
		list: React.PropTypes.array,
		isSideShown: React.PropTypes.bool
	},

	getDefaultProps() {
		return {};
	},

	getInitialState() {
		return {
			active: null,
			timer: null,
			delayTimeout: null
		};
	},

	componentWillMount() {
		this.setState({active: this.props.isSideShown || null});
	},

	handleClick() {
		this._debounce(this.state.active ? null : true);
	},

	_debounce(active) {
		const state = this.state;
		let delay = active ? 500 : 0;
		clearTimeout(state.delayTimeout);
		if (!state.timer) {
			this.setState({
				delayTimeout: setTimeout(() => {
					this.setState({
						active: active
					});
				}, delay),
				timer: setTimeout(() => {
					this.setState({
						timer: null
					});
				}, 100)
			});
		}
	},

	handleMouseEnter() {
		this._debounce(true);
	},

	handleMouseLeave() {
		this._debounce(null);
	},

	render() {
		return (
			<div
				onClick={this.handleClick}
				onMouseEnter={this.handleMouseEnter}
				onMouseLeave={this.handleMouseLeave}
				>
				<Dropdown active={this.state.active}>
					<DropdownTrigger>Категории</DropdownTrigger>
					<DropdownContent>
						<SimpleMenu
							list={this.props.list}
							sorting={categoriesSorting}
							/>
					</DropdownContent>
				</Dropdown>
			</div>
		);
	}
});

export default SidebarCats;
