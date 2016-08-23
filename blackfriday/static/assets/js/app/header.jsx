/* global React, window */
/* eslint react/require-optimization: 0 */
/* eslint react/jsx-no-bind: ["error", {ignoreRefs: true}] */

import SimpleMenu from './simple-menu.jsx';
import {categoriesSorting} from './utils.js';

class Header extends React.Component {
	constructor() {
		super();
		this.state = {isCollapsed: true};
		this.handleClick = this.handleClick.bind(this);
	}

	toggle() {
		this.setState({isCollapsed: !this.state.isCollapsed});
	}

	handleClick() {
		this.toggle();
	}

	componentDidMount() {
		window.addEventListener('click', this._onWindowClick.bind(this));
	}

	componentWillUnmount() {
		window.removeEventListener('click', this._onWindowClick.bind(this));
	}

	_onWindowClick(event) {
		const element = this.node;

		if (
			event.target !== element &&
			!element.contains(event.target) &&
			!this.state.isCollapsed
		) {
			this.toggle();
		}
	}

	_onToggleClick(event) {
		event.preventDefault();
		this.toggle();
	}

	render() {
		const isCollapsed = this.state.isCollapsed;
		return (
			<div
				className="container"
				ref={node => {
					this.node = node;
				}}
				>
				<div className="navbar-header">
					<button onClick={this.handleClick} type="button" className={`navbar-toggle${isCollapsed ? ' collapsed' : ''}`}>
						<span className="icon-bar"/>
						<span className="icon-bar"/>
						<span className="icon-bar"/>
					</button>
				</div>
				<div className={`navbar-collapse collapse${isCollapsed ? '' : ' in'}`}>
					<div className="row row-main">
						<div className="col-sm-3 col-md-3">
							<div className="header-menu">
								<SimpleMenu list={this.props.headerMenu}/>
							</div>
						</div>
						<div className="col-sm-9 col-md-9">
							<div className="header-cats">
								<SimpleMenu list={this.props.categories} sorting={categoriesSorting}/>
							</div>
						</div>
					</div>
				</div>
			</div>
		);
	}
}
Header.propTypes = {
	headerMenu: React.PropTypes.array.isRequired,
	categories: React.PropTypes.array.isRequired
};

export default Header;
