import React from 'react';

const SimpleMenu = React.createClass({
	propTypes: {
		list: React.PropTypes.array,
		onClick: React.PropTypes.func,
		sorting: React.PropTypes.func
	},

	handleClick(e, id) {
		if (!this.props.onClick) {
			return;
		}

		this.props.onClick(e, id);
	},

	render() {
		let list = this.props.list.slice();

		if (this.props.sorting && (typeof this.props.sorting === 'function')) {
			list.sort(this.props.sorting);
		}

		return (
			<ul className="simple-menu">
				{list.map((item, index) => (
					<SimpleMenuItem
						key={index}
						onClick={this.handleClick}
						{...item}
						/>
				))}
			</ul>
		);
	}
});

export default SimpleMenu;

const SimpleMenuItem = React.createClass({
	propTypes: {
		id: React.PropTypes.number,
		name: React.PropTypes.string,
		onClick: React.PropTypes.func,
		url: React.PropTypes.string
	},

	handleClick(e) {
		if (!this.props.onClick) {
			return;
		}

		this.props.onClick(e, this.props.id);
	},

	render() {
		const {url, name} = this.props;

		return (
			<li className="simple-menu__item">
				<a
					className="simple-menu__link"
					href={url}
					onClick={this.handleClick}
					>
					{name}
				</a>
			</li>
		);
	}
});
